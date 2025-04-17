import Navbar0 from "../../Navbar0";
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function Header({ menus }) {
    const navigate = useNavigate();
    return (
        <>
            <Navbar0 menus={menus} />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'right',
                    '& > *': {
                        m: 1,
                    },
                }}
            >
                <ButtonGroup variant="text" aria-label="text button group" >
                    <Button onClick={() => { navigate('/dashboard') }}>Módulos</Button>
                </ButtonGroup>
            </Box>
        </>
    );
}

export default Header;