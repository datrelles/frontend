import React, { useState,useRef } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import {useAuthContext} from "../../../context/authContext";
import {toast} from "react-toastify";
import Box from "@mui/material/Box";

const API = process.env.REACT_APP_API;

const ImageUploader = ({ onUploadComplete }) => {
    const {jwt} = useAuthContext();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);



    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const uploadToS3 = async (file) => {
        try {
            const res = await fetch(`${API}/s3/generate-upload-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + jwt
                },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type
                })
            });

            const result = await res.json();

            if (!res.ok) {
                console.error("Error al generar url firmada:", result.error);
                toast.error(result.error || "Error guardando imagen");
                return;
            }

            toast.success("Imagen registrada correctamente");

            const { uploadUrl, publicUrl } = result;

            await axios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type
                }
            });

            return publicUrl;
        } catch (err) {
            console.error("Error al subir a S3:", err);
            toast.error("Error subiendo archivo");
            return null;
        }
    };

    const guardarImagenEnBase = async (publicUrl, fileName) => {
        try {
            const token = jwt || localStorage.getItem("jwt");

            const res = await fetch(`${API}/s3/insert_path_imagen`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    path_imagen: publicUrl,
                    descripcion_imagen: fileName
                })
            });

            const result = await res.json();

            if (!res.ok) {
                console.error("Error guardando URL en base:", result.error);
                toast.error(result.error || "Error guardando imagen");
                return;
            }

            toast.success("Imagen registrada correctamente");

        } catch (error) {
            console.error("Error guardando URL en base:", error);
            toast.error("Error guardando imagen");
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        const urls = [];

        for (const file of selectedFiles) {
            const url = await uploadToS3(file);
            if (url) {
                urls.push(url);
                await guardarImagenEnBase(url, file.name);
            }
        }
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }

        setUploading(false);
        onUploadComplete(urls);
    };

    return (
        <Box display="flex" alignItems="flex-start" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    id="upload-input"
                />
                <label htmlFor="upload-input">
                    <Button
                        component="span"
                        variant="outlined"
                        style={{
                            backgroundColor: "firebrick",
                            color: "white",
                            height: '37px'
                        }}
                        disabled={uploading}
                    >
                        Elegir archivos
                    </Button>
                </label>
                <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    variant="contained"
                    style={{
                        backgroundColor: "firebrick",
                        color: "white",
                        height: '37px'
                    }}
                >
                    Subir imágenes
                </Button>
            </Box>
            {selectedFiles.length > 0 && (
                <Box color="gray">
                    <div>
                        {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.9rem' }}>
                        {selectedFiles.map((file, idx) => (
                            <li key={idx}>{file.name}</li>
                        ))}
                    </ul>
                </Box>
            )}
        </Box>
    );

};

export default ImageUploader;
