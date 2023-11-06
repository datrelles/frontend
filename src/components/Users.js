import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/authContext";
const API = process.env.REACT_APP_API;

function Users() {
    const {jwt}=useAuthContext();
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [editing, setEditing] = useState(false)
    const [id, setId] = useState('')

    const [users, setUsers] = useState([])


    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!editing) {
            const res = await fetch(`${API}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    password
                })
            })
            const data = await res.json();
            console.log(data)
        } else {
            const res = await fetch(`${API}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    username: name,
                    email,
                    password
                })
            })
            const data = await res.json();
            console.log(data)
            setEditing(false);
            setId('');

        }

        await getUsers();

        setName('');
        setEmail('');
        setPassword('');
    }

    const getUsers = async () => {
        const res = await fetch(`${API}/users`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            }
        })

        const data = await res.json();
        setUsers(data)
        console.log(data)
    }

    useEffect(() => {
        getUsers();
    }, [])

    const editUser = async (id) => {
        const res = await fetch(`${API}/user/${id}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            })
        const data = await res.json();
        console.log(data)

        setEditing(true);

        setId(id)
        setName(data.USUARIO_ORACLE)
        setEmail(data.E_MAIL)
        setPassword(data.PASSWORD)
    }

    const deleteUser = async (id) => {
        const userResponse = window.confirm('Seguro desea eliminar este registro?')
        if (userResponse) {
            const res = await fetch(`${API}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                }
            });
            const data = await res.json();
            console.log(data)
            await getUsers();
        }
    }

    return (
        <div className="row">
            <div className="col-md-4">
                <form onSubmit={handleSubmit} className="card card-body">
                    <div className="form-group">
                        <input type="text"
                            onChange={e => setName(e.target.value)}
                            value={name}
                            className="form-control"
                            placeholder="Name"
                            autoFocus />
                    </div>
                    <div className="form-group">
                        <input type="email"
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            className="form-control"
                            placeholder="Email"
                        />
                    </div>
                    <div className="form-group">
                        <input type="password"
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            className="form-control"
                            placeholder="Password"
                        />
                    </div>
                    <button className="btn btn-primary btn-block">
                        {editing ? 'Editar' : 'Crear'}
                    </button>
                </form>
            </div>
            <div className="col-md-6">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Primer Apellido</th>
                            <th>Segundo Apellido</th>
                            <th>Nombre</th>
                            <th>Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.USUARIO_ORACLE}>
                                <td>{user.USUARIO_ORACLE}</td>
                                <td>{user.APELLIDO1}</td>
                                <td>{user.APELLIDO2}</td>
                                <td>{user.NOMBRE}</td>
                                <td>
                                    <button className="btn btn-secondary btn-sm btn-block"
                                        onClick={() => editUser(user.USUARIO_ORACLE)}>
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm btn-block"
                                        onClick={() => deleteUser(user.USUARIO_ORACLE)}
                                    >
                                        Borrar
                                    </button>
                                </td>
                            </tr>
                        )
                        )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Users;