import { List, ListItem } from "@mui/material";
import CustomGrid from "./custom-grid";

export default function CustomList({ mt, items }) {
  return (
    <List sx={{ mt: mt }} disablePadding>
      {items.map((item) => (
        <ListItem key={item.id}>
          {<CustomGrid items={item.grid_items} />}
        </ListItem>
      ))}
    </List>
  );
}
