import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { fetchAPI } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ErrorDisplay from "../components/ErrorDisplay.jsx";
import Loading from "../components/Loading.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "./ShoppingListPage.css";

function ShoppingListPage() {
  const { logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newListName, setNewListName] = useState("");
  const [selectedList, setSelectedList] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");
  const [deleteListId, setDeleteListId] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  async function fetchLists() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAPI("/api/shopping-lists");
      setLists(data || []);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to fetch lists");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList() {
    if (!newListName.trim()) {
      setError("List name cannot be empty");
      return;
    }
    setError("");
    try {
      const newList = await fetchAPI("/api/shopping-lists", {
        method: "POST",
        body: {
          name: newListName.trim(),
          items: [],
        },
      });
      setLists([newList, ...lists]);
      setNewListName("");
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to create list");
    }
  }

  function handleDeleteListClick(id) {
    setDeleteListId(id);
  }

  async function handleDeleteList() {
    if (!deleteListId) return;
    const id = deleteListId;
    setDeleteListId(null);
    setError("");
    try {
      await fetchAPI(`/api/shopping-lists/${id}`, {
        method: "DELETE",
      });
      setLists(lists.filter((list) => list._id !== id));
      if (selectedList && selectedList._id === id) {
        setSelectedList(null);
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to delete list");
    }
  }

  function handleViewList(list) {
    setSelectedList(list);
  }

  function handleBackToList() {
    setSelectedList(null);
    fetchLists();
  }

  async function handleAddItemToList(listId) {
    if (!newItemName.trim()) {
      setError("Item name cannot be empty");
      return;
    }
    setError("");

    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const newItem = {
      itemId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: parseInt(newItemQuantity) || 1,
      checked: false,
      price: null,
    };

    const updatedItems = [...(list.items || []), newItem];

    setLists((prevLists) =>
      prevLists.map((l) =>
        l._id === listId ? { ...l, items: updatedItems } : l,
      ),
    );
    if (selectedList && selectedList._id === listId) {
      setSelectedList((prev) => ({ ...prev, items: updatedItems }));
    }
    setNewItemName("");
    setNewItemQuantity("1");

    try {
      await fetchAPI(`/api/shopping-lists/${listId}`, {
        method: "PUT",
        body: {
          items: updatedItems,
        },
      });
      const freshList = await fetchAPI(`/api/shopping-lists/${listId}`);
      if (freshList) {
        setLists((prevLists) =>
          prevLists.map((l) => (l._id === listId ? freshList : l)),
        );
        if (selectedList && selectedList._id === listId) {
          setSelectedList(freshList);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to add item");
    }
  }

  async function handleDeleteItemFromList(listId, itemId) {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const updatedItems = (list.items || []).filter(
      (item) => item.itemId !== itemId,
    );

    setLists((prevLists) =>
      prevLists.map((l) =>
        l._id === listId ? { ...l, items: updatedItems } : l,
      ),
    );
    if (selectedList && selectedList._id === listId) {
      setSelectedList((prev) => ({ ...prev, items: updatedItems }));
    }

    try {
      await fetchAPI(`/api/shopping-lists/${listId}`, {
        method: "PUT",
        body: {
          items: updatedItems,
        },
      });
      const freshList = await fetchAPI(`/api/shopping-lists/${listId}`);
      if (freshList) {
        setLists((prevLists) =>
          prevLists.map((l) => (l._id === listId ? freshList : l)),
        );
        if (selectedList && selectedList._id === listId) {
          setSelectedList(freshList);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to delete item");
    }
  }

  async function handleCheckOffItem(listId, itemId) {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const updatedItems = (list.items || []).map((item) =>
      item.itemId === itemId ? { ...item, checked: !item.checked } : item,
    );

    setLists((prevLists) =>
      prevLists.map((l) =>
        l._id === listId ? { ...l, items: updatedItems } : l,
      ),
    );
    if (selectedList && selectedList._id === listId) {
      setSelectedList((prev) => ({ ...prev, items: updatedItems }));
    }

    try {
      await fetchAPI(`/api/shopping-lists/${listId}`, {
        method: "PUT",
        body: {
          items: updatedItems,
        },
      });
      const freshList = await fetchAPI(`/api/shopping-lists/${listId}`);
      if (freshList) {
        setLists((prevLists) =>
          prevLists.map((l) => (l._id === listId ? freshList : l)),
        );
        if (selectedList && selectedList._id === listId) {
          setSelectedList(freshList);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to check off item");
    }
  }

  async function handleCheckOffAllItems(listId) {
    const list = lists.find((l) => l._id === listId);
    if (!list) return;

    const allChecked = (list.items || []).every((item) => item.checked);
    const updatedItems = (list.items || []).map((item) => ({
      ...item,
      checked: !allChecked,
    }));

    setLists((prevLists) =>
      prevLists.map((l) =>
        l._id === listId ? { ...l, items: updatedItems } : l,
      ),
    );
    if (selectedList && selectedList._id === listId) {
      setSelectedList((prev) => ({ ...prev, items: updatedItems }));
    }

    try {
      await fetchAPI(`/api/shopping-lists/${listId}`, {
        method: "PUT",
        body: {
          items: updatedItems,
        },
      });
      const freshList = await fetchAPI(`/api/shopping-lists/${listId}`);
      if (freshList) {
        setLists((prevLists) =>
          prevLists.map((l) => (l._id === listId ? freshList : l)),
        );
        if (selectedList && selectedList._id === listId) {
          setSelectedList(freshList);
        }
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setError(err.message || "Failed to check off all items");
    }
  }

  if (loading) {
    return (
      <div className="shopping-list-page">
        <Loading />
      </div>
    );
  }

  if (selectedList) {
    return (
      <div className="shopping-list-page">
        <div className="shopping-list-page__detail-section">
          <h2>{selectedList.name}</h2>
          <ErrorDisplay error={error} />
          <button onClick={handleBackToList}>← Back to Lists</button>
        </div>

        <div className="shopping-list-page__add-item-section">
          <h3>Add Item</h3>
          <div>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item name"
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Quantity"
              min="1"
              className="shopping-list-page__quantity-input"
            />
            <button
              onClick={() => handleAddItemToList(selectedList._id)}
              className="shopping-list-page__add-item-btn"
            >
              Add Item
            </button>
          </div>
        </div>

        <div className="shopping-list-page__items-section">
          <div className="shopping-list-page__items-header">
            <h3>Items ({selectedList.items?.length || 0})</h3>
            {selectedList.items && selectedList.items.length > 0 && (
              <button onClick={() => handleCheckOffAllItems(selectedList._id)}>
                {selectedList.items.every((item) => item.checked)
                  ? "Uncheck All"
                  : "Check All"}
              </button>
            )}
          </div>
          {!selectedList.items || selectedList.items.length === 0 ? (
            <EmptyState message="No items in this list. Add one above!" />
          ) : (
            <ul>
              {selectedList.items.map((item) => (
                <li
                  key={item.itemId}
                  className={`shopping-list-page__item-row ${item.checked ? "shopping-list-page__item-row--checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={() =>
                      handleCheckOffItem(selectedList._id, item.itemId)
                    }
                  />
                  <span>
                    {item.name} (Qty: {item.quantity || 1})
                  </span>
                  <button
                    onClick={() =>
                      handleDeleteItemFromList(selectedList._id, item.itemId)
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="shopping-list-page">
      <h2>Shopping Lists</h2>
      <ErrorDisplay error={error} />
      <div className="shopping-list-page__create-section">
        <div>
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name"
          />
          <button onClick={handleCreateList}>Create</button>
        </div>
      </div>
      {lists.length === 0 ? (
        <div className="shopping-list-page__lists-section">
          <EmptyState message="No lists yet. Create one above!" />
        </div>
      ) : (
        <div className="shopping-list-page__lists-section">
          <ul>
            {lists.map((list) => (
              <li key={list._id}>
                <span>
                  {list.name} ({list.items?.length || 0} items)
                </span>
                <div>
                  <button onClick={() => handleViewList(list)}>View</button>
                  <button onClick={() => handleDeleteListClick(list._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {deleteListId !== null ? (
        <ConfirmDialog
          title="Delete List"
          message="Are you sure you want to delete this list?"
          confirmType="delete"
          onConfirm={handleDeleteList}
          onCancel={() => setDeleteListId(null)}
        />
      ) : null}
    </div>
  );
}

ShoppingListPage.propTypes = {};

export default ShoppingListPage;
