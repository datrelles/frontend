export function createEmptyItem(xs, id) {
  return {
    xs,
    id,
    customComponent: <></>,
  };
}

export function createDefaultSetter(setter) {
  return (e) => setter(e.target.value);
}

export function createTextFieldItem(
  xs,
  id,
  label,
  value,
  setValue = null,
  required = true,
  placeholder = "",
  disabled = !setValue,
  type = "text"
) {
  return {
    xs,
    id,
    label,
    value,
    setValue,
    required,
    placeholder,
    disabled,
    type,
  };
}

export function createCustomComponentItem(xs, id, customComponent) {
  return {
    xs,
    id,
    customComponent,
  };
}

export function createCustomTooltip(title, onClick, icon) {
  return {
    title,
    onClick,
    icon,
  };
}

export function createCustomListItem(id, gridItems) {
  return { id, gridItems };
}
