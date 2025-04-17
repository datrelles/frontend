import Button from '@mui/material/Button';
import AddIcon from '@material-ui/icons/Add';

function BtnNuevo({ onClick, disabled = false, texto = "Nuevo" }) {
    return (
        <Button
            disabled={disabled}
            style={{ marginBottom: '10px', marginTop: '10px', backgroundColor: 'firebrick', color: 'white', borderRadius: '5px', marginRight: '15px' }}
            onClick={onClick}>
            <AddIcon /> {texto}
        </Button>
    );
}

export default BtnNuevo;