import { useState } from "react";

const Input = ({
  name,
  type,
  id,
  placeholder,
  icon,
  disabled = false,
  value = "",
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        type={
          type === "password" ? (passwordVisible ? "text" : "password") : type
        }
        id={id}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className="input-box"
      />
      <i className={"fi " + icon + " input-icon"} />
      {type === "password" && (
        <i
          onClick={() => setPasswordVisible((currentVal) => !currentVal)}
          className={`input-icon left-[auto] right-4 cursor-pointer fi fi-sr-eye ${
            !passwordVisible ? "-crossed" : ""
          }`}
        />
      )}
    </div>
  );
};

export default Input;
