import React, { useEffect, useState } from "react";
import { BsCheck, BsX, BsChevronDown, BsChevronUp } from "react-icons/bs";

function PasswordChecklistChecker({
  rules = { minLength: 8, capital: 0, specialChar: 0, number: 0, match: false },
  password = "",
  repeatedPassword = "",
  onChange,
  isHideRuleOnSuccess = false,
  isCollapsable = true,
}) {
  const [checklist, setChecklist] = useState({
    minLength: false,
    capital: false,
    specialChar: false,
    number: false,
    match: false,
  });

  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const validateRules = () => {
      const capitalRegex = /[A-Z]/;
      const specialCharRegex = /[^A-Za-z0-9]/;
      const numberRegex = /[0-9]/;

      const updatedChecklist = {
        minLength: password.length >= rules.minLength,
        capital: (password.match(capitalRegex) || []).length >= rules.capital,
        specialChar: (password.match(specialCharRegex) || []).length >= rules.specialChar,
        number: (password.match(numberRegex) || []).length >= rules.number,
        match: repeatedPassword !== undefined ? password === repeatedPassword : rules.match === false,
      };

      setChecklist(updatedChecklist);

      if (onChange) {
        const allValid = Object.values(updatedChecklist).every(Boolean);
        onChange(allValid);
      }
    };

    validateRules();
  }, [password, repeatedPassword, rules, onChange]);

  const showRuleHelper = (condition, text) => {
    if (isHideRuleOnSuccess && condition) return null;
    return (
      <li className="flex items-center">
        {condition ? <BsCheck className="text-green-500" /> : <BsX className="text-red-500" />}
        <span className="ml-2">{text}</span>
      </li>
    );
  };

  return (
    <div className="rounded-md w-full max-w-sm bg-card">
      {isCollapsable && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsCollapsed((prev) => !prev);
          }}
          className="flex items-center justify-between w-full bg-card text-sm font-semibold text-copy-primary"
        >
          <span>Password Requirements</span>
          {isCollapsed ? <BsChevronDown /> : <BsChevronUp />}
        </button>
      )}
      {!isCollapsed && (
        <ul className="space-y-2 p-2 text-copy-secondary">
          {showRuleHelper(checklist.minLength, `Minimum ${rules.minLength} characters`)}
          {rules.capital > 0 &&
            showRuleHelper(
              checklist.capital,
              `At least ${rules.capital} capital letter${rules.capital > 1 ? "s" : ""}`
            )}
          {rules.specialChar > 0 &&
            showRuleHelper(
              checklist.specialChar,
              `At least ${rules.specialChar} special character${rules.specialChar > 1 ? "s" : ""}`
            )}
          {rules.number > 0 &&
            showRuleHelper(checklist.number, `At least ${rules.number} number${rules.number > 1 ? "s" : ""}`)}
          {rules.match && showRuleHelper(checklist.match, "Passwords match")}
        </ul>
      )}
    </div>
  );
}

export default PasswordChecklistChecker;

// Basic rules for password
/*
    - Length (minLength)
    - Capital (capital)
    - Special Character (specialChar)
    - Number (number)
    - Match (match)
*/
