import { List, ListItem } from "@mui/material";
import CustomGrid from "./custom-grid";

export default function CustomList({ items, mt = 2 }) {
  return (
    <List sx={{ mt: mt }} disablePadding>
      {items.map((item) => (
        <ListItem key={item.id}>
          {<CustomGrid items={item.gridItems} />}
        </ListItem>
      ))}
    </List>
  );
}
