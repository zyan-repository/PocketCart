import PropTypes from "prop-types";

function Loading({ message = "Loading..." }) {
  return <div>{message}</div>;
}

Loading.propTypes = {
  message: PropTypes.string,
};

export default Loading;
