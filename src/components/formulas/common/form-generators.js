export function createEmptyItem(xs, id) {
  return {
    xs,
    id,
    custom_component: <></>,
  };
}

export function createTextFieldItem(
  xs,
  id,
  label,
  value,
  setValue = null,
  required = true,
  placeholder = "",
  disabled = !setValue
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
  };
}

export function createCustomComponentItem(xs, id, custom_component) {
  return {
    xs,
    id,
    custom_component,
  };
}
