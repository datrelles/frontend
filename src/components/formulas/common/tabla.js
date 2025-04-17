import { ThemeProvider } from '@mui/material/styles';
import { createMuiTheme } from '../../../helpers/modulo-formulas';
import MUIDataTable from "mui-datatables";

function Tabla({ title, data, columns, options, theme = createMuiTheme() }) {
    return (
        <ThemeProvider theme={theme}>
            <MUIDataTable
                title={title}
                data={data}
                columns={columns}
                options={options}
            />
        </ThemeProvider>
    );
}

export default Tabla;