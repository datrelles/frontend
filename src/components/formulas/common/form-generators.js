export function createTextFieldItem(
  xs,
  id,
  label,
  value,
  setValue = null,
  required = true,
  placeholder = ""
) {
  return {
    xs,
    id,
    label,
    value,
    setValue,
    required,
    placeholder,
  };
}

export function createCustomComponentItem(xs, id, custom_component) {
  return {
    xs,
    id,
    custom_component,
  };
}
