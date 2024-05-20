import React, { useEffect, useRef, useState } from "react";

// Exporting activeTab and activeTagLineTag for external use
export let activeTabRef;
export let activeTagLineTagRef;

const InpageNavigation = ({
  routes,
  defaultActiveindex = 0,
  defaultHidden = [],
  children,
}) => {
  // Refs for active tab and active tag line element
  activeTagLineTagRef = useRef();
  activeTabRef = useRef();

  // State for managing the current active navigation index
  const [inPageNavIndex, setPageNavIndex] = useState(defaultActiveindex);

  // State for tracking window width and whether resize event listener is added
  let [width, setWidth] = useState(window.innerWidth);
  let [isResizeEventAdded, setIsResizeEventAdded] = useState(false);

  // useEffect for handling window resize and setting default active tab
  useEffect(() => {
    // If the window width is greater than 766 and default active index is not the same as inPageNavIndex, change the page state
    if (width > 766 && inPageNavIndex !== defaultActiveindex) {
      changePageState(activeTabRef.current, defaultActiveindex);
    }

    // Adding resize event listener if not already added
    if (!isResizeEventAdded) {
      window.addEventListener("resize", () => {
        if (!isResizeEventAdded) {
          setIsResizeEventAdded(true);
        }
        setWidth(window.innerWidth);
      });
    }
  }, [width]);

  // Logging current width for debugging purposes
  console.log(width);

  // Function to add the style line on active state with exact size of the text
  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;
    console.log(offsetLeft, offsetWidth);

    activeTagLineTagRef.current.style.width = offsetWidth + "px";
    activeTagLineTagRef.current.style.left = offsetLeft + "px";
    setPageNavIndex(i);
  };

  return (
    <>
      {/* Navigation bar with buttons for each route */}
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            key={route} // Key prop to avoid React warning
            ref={i === defaultActiveindex ? activeTabRef : null} // Assigning ref to the default active tab
            onClick={(e) => {
              changePageState(e.target, i); // Changing page state on button click
            }}
            className={
              "p-4 px-5 capitalize " +
              (inPageNavIndex === i ? "text-black " : "text-dark-grey ") + // Conditional class for active/inactive state
              (defaultHidden.includes(route) ? " md:hidden" : " ") // Conditionally hide certain routes on medium screens
            }
          >
            {route}
          </button>
        ))}

        {/* Active tag line element */}
        <hr
          className="absolute bottom-0 duration-300 border-dark-grey"
          ref={activeTagLineTagRef}
        />
      </div>
      {/* Rendering children based on the active navigation index */}
      {Array.isArray(children) ? children[inPageNavIndex] : children}
    </>
  );
};

export default InpageNavigation;
