import PropTypes from "prop-types";
import "./ConfirmDialog.css";

function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmType = "default",
}) {
  const confirmClassName =
    confirmType === "delete"
      ? "confirm-dialog-confirm delete"
      : "confirm-dialog-confirm";

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title || "Confirm"}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-buttons">
          <button onClick={onCancel} className="confirm-dialog-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className={confirmClassName}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmType: PropTypes.oneOf(["default", "delete"]),
};

export default ConfirmDialog;
