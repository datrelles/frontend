/// ********************* MODULO PARA CREACION DE ENCUESTAS PARA CADENAS Y MAYOREO
import { Box, Typography, TextField,
    FormControl, RadioGroup, Radio,
    FormControlLabel, Accordion, AccordionSummary, AccordionDetails,FormGroup, Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Grid} from "@material-ui/core";
import { useState } from "react";

function RadioEscala({ label, value, onChange, required = false, showNA = false, naLabel = "N/A", disabled = false }) {
    return (
        <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
                <Typography
                    sx={{
                        whiteSpace: 'normal',
                        overflow: 'visible',
                        textOverflow: 'unset',
                        fontSize: '16px'
                    }}
                >
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup row value={value} onChange={onChange}>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <FormControlLabel
                                key={num}
                                value={String(num)}
                                control={
                                    <Radio
                                        size="small"
                                        disabled={disabled}
                                        sx={{
                                            '&.Mui-checked': { color: 'firebrick' },
                                            '&:hover': { backgroundColor: 'rgba(178, 34, 34, 0.08)' }
                                        }}
                                    />
                                }
                                label={num}
                                labelPlacement="end"
                                sx={{ mx: 1 }}
                            />
                        ))}
                        {showNA && (
                            <FormControlLabel
                                value="N/A"
                                control={
                                    <Radio
                                        size="small"
                                        disabled={disabled}
                                        sx={{
                                            '&.Mui-checked': { color: 'firebrick' },
                                            '&:hover': { backgroundColor: 'rgba(178, 34, 34, 0.08)' }
                                        }}
                                    />
                                }
                                label={naLabel}
                                labelPlacement="end"
                                sx={{ mx: 1 }}
                            />
                        )}
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
}


function RadioSiNo({ label, value, onChange, required = false, naLabel = null, disabled = false }) {
    return (
        <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
                <Typography sx={{ whiteSpace: "normal", fontSize: "16px" }}>
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup row value={value} onChange={onChange}>
                        <FormControlLabel
                            value="SI"
                            control={<Radio size="small" sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                            label="SI"
                            sx={{ mx: 1 }}
                        />
                        <FormControlLabel
                            value="NO"
                            control={<Radio size="small" sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                            label="NO"
                            sx={{ mx: 1 }}
                        />
                        {naLabel && (
                            <FormControlLabel
                                value="N/A"
                                control={<Radio size="small" sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                                label={naLabel}
                                sx={{ mx: 1 }}
                            />
                        )}
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
}

function EncuestaForm() {
    const [form, setForm] = useState({
        existe_promo: '',
        conoc_promo: ''
    });

    const handleChange = (campo) => (event) => {
        const value = event.target.value;
        setForm((prev) => ({
            ...prev,
            [campo]: value
        }));
    };

    return (
        <div>
            <RadioSiNo
                label="18. ¿Existe promocional actual de la marca? (Dirigido al cliente final) *"
                value={form.existe_promo}
                onChange={handleChange('existe_promo')}
                naLabel="NO HAY PROMOCIONAL"
                disabled={false}
            />
            {form.existe_promo === 'SI' && (
                <RadioSiNo
                    label=" 18.1. ¿Tienen los vendedores de piso conocimiento de promocional actual de la marca? (Dirigido al cliente final) *"
                    value={form.conoc_promo}
                    onChange={handleChange('conoc_promo')}
                    disabled={false}
                />
            )}
        </div>
    );
}

function CampoTexto({ label, value, onChange, required = false, disabled = false, placeholder }) {
    const handleChange = (e) => {
        const newValue = e.target.value;
        if (newValue === "") {
            onChange(e);
            return;
        }
        const num = Number(newValue);
        if (!Number.isInteger(num)) return;
        if (num >= 0 && num <= 100) {
            onChange(e);
        }
    };

    return (
        <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
                <Typography sx={{ fontSize: "16px" }}>
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                    type="number"
                    value={value}
                    onChange={handleChange}
                    size="small"
                    placeholder={placeholder}
                    disabled={disabled}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    sx={{
                        width: "100px",
                        ml: 1
                    }}
                />
            </Grid>
        </Grid>
    );
}

function RadioOpciones({ label, value, onChange, options = [], required = false, disabled = false }) {
    return (
        <Grid container alignItems="center" spacing={2}>
            <Grid item xs={6}>
                <Typography sx={{ whiteSpace: "normal", fontSize: "16px" }}>
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup row value={value} onChange={onChange}>
                        {options.map((opt) => (
                            <FormControlLabel
                                key={opt}
                                value={opt}
                                control={<Radio size="small" sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                                label={opt}
                                sx={{ mx: 1 }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
}


function EncuestaExhibicion({ form, setForm, handleChange, esRetail, disabled }) {

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography fontWeight="bold">Estado de la exhibición</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    <RadioEscala label="1. ¿La exhibición se encuentra limpia y ordenada?"
                                 value={form.limp_orden || ''} onChange={handleChange('limp_orden')} disabled={disabled} required />
                    <RadioSiNo
                        label="2. ¿El material POP se encuentra actualizado? *"
                        value={form.pop_actual || ""}
                        onChange={handleChange("pop_actual")}
                        disabled={disabled}
                    />
                    {form.pop_actual === "NO" && (
                        <div>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los materiales que están desactualizados:
                            </Typography>
                            <FormGroup>
                                {[
                                    "Falta material de campaña",
                                    "Falta colgante de manubrio",
                                    "Falta colgantes de techo",
                                    "Falta afiches",
                                    "Falta fibrines",
                                    "Otros",
                                ].map((material) => (
                                    <div key={material}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={form.pop_material_desactualizado?.includes(material) || false}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        if (isChecked) {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                pop_material_desactualizado: [
                                                                    ...(prev.pop_material_desactualizado || []),
                                                                    material,
                                                                ],
                                                            }));
                                                        } else {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                pop_material_desactualizado: (
                                                                    prev.pop_material_desactualizado || []
                                                                ).filter((item) => item !== material),
                                                                // limpiar texto si desmarca "Otros"
                                                                ...(material === "Otros" ? { otros_pop_material: "" } : {}),
                                                            }));
                                                        }
                                                    }}
                                                />
                                            }
                                            label={material}
                                        />
                                        {material === "Otros" &&
                                            form.pop_material_desactualizado?.includes("Otros") && (
                                                <TextField
                                                    label="Especifique otros materiales"
                                                    value={form.otros_pop_material || ""}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            otros_pop_material: e.target.value.toUpperCase(),
                                                        }))
                                                    }
                                                    fullWidth
                                                    size="small"
                                                    sx={{ mt: 1, ml: 4 }}
                                                />
                                            )}
                                    </div>
                                ))}
                            </FormGroup>
                        </div>
                    )}
                    <CampoTexto
                        label="3. Indicar la cobertura del material POP en la tienda (%) "
                        value={form.pop_sufic ?? ''}
                        onChange={(e) => handleChange('pop_sufic')({ target: { value: e.target.value } })}
                        type="number"
                        required
                        disabled={disabled}
                        placeholder="%"
                    />
                    {esRetail && (
                        <RadioEscala
                            label="4. ¿Se encuentran los precios visibles y correctos?"
                            value={form.prec_vis_corr || ''}
                            onChange={handleChange('prec_vis_corr')}
                            required
                            showNA
                            naLabel="NO APLICA"
                            disabled={disabled}
                        />
                    )}
                    <RadioSiNo
                        label="5. ¿Existen motos con imperfectos? *"
                        value={form.motos_desper || ''}
                        onChange={handleChange('motos_desper')}
                        disabled={disabled}
                    />
                    {form.motos_desper === 'SI' && (
                        <div>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los daños observados en la moto:
                            </Typography>
                            <FormGroup>
                                {[
                                    "Rayaduras",
                                    "Golpes en la pintura",
                                    "Asiento dañado",
                                    "Luces defectuosas",
                                    "Llantas desgastadas",
                                    "Espejos rotos",
                                    "Otros"
                                ].map((dano) => (
                                    <FormControlLabel
                                        key={dano}
                                        control={
                                            <Checkbox
                                                checked={form.motos_danos?.includes(dano) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            motos_danos: [
                                                                ...(prev.motos_danos || []),
                                                                dano,
                                                            ],
                                                        }));
                                                    } else {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            motos_danos: (
                                                                prev.motos_danos || []
                                                            ).filter((item) => item !== dano),
                                                        }));
                                                    }
                                                }}
                                            />
                                        }
                                        label={dano}
                                    />
                                ))}
                            </FormGroup>
                        </div>
                    )}
                    <RadioSiNo
                        label="6. ¿Existen motos con componentes faltantes? *"
                        value={form.motos_desper || ''}
                        onChange={handleChange('motos_desper')}
                        disabled={disabled}
                    />
                    {form.motos_desper === 'SI' && (
                        <div>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los daños observados en la moto:
                            </Typography>
                            <FormGroup>
                                {[
                                    "Rayaduras",
                                    "Golpes en la pintura",
                                    "Asiento dañado",
                                    "Luces defectuosas",
                                    "Llantas desgastadas",
                                    "Espejos rotos",
                                    "Otros"
                                ].map((dano) => (
                                    <FormControlLabel
                                        key={dano}
                                        control={
                                            <Checkbox
                                                checked={form.motos_danos?.includes(dano) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            motos_danos: [
                                                                ...(prev.motos_danos || []),
                                                                dano,
                                                            ],
                                                        }));
                                                    } else {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            motos_danos: (
                                                                prev.motos_danos || []
                                                            ).filter((item) => item !== dano),
                                                        }));
                                                    }
                                                }}
                                            />
                                        }
                                        label={dano}
                                    />
                                ))}
                            </FormGroup>
                        </div>
                    )}
                    <RadioOpciones
                        label="7. ¿Estado de la batería?"
                        value={form.estado_bateria || ''}
                        onChange={handleChange('estado_bateria')}
                        options={["Vigente", "Próximo a caducar", "Caducada"]}
                        required
                        disabled={disabled}
                    />
                    <RadioSiNo
                        label="8. ¿La publicidad/branding de la marca se encuentra actualizada y en buen estado? *"
                        value={form.estado_publi || ''}
                        onChange={handleChange('estado_publi')}
                        naLabel="NO HAY PUBLICIDAD"
                        disabled={disabled}
                    />
                    {form.estado_publi === 'NO' && (
                        <div>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los problemas encontrados en la publicidad/branding:
                            </Typography>
                            <FormGroup>
                                {[
                                    "Colores desgastados",
                                    "Material roto",
                                    "Soporte dañado",
                                    "Mal instalado",
                                    "Publicidad desactualizada",
                                    "Otros"
                                ].map((problema) => (
                                    <FormControlLabel
                                        key={problema}
                                        control={
                                            <Checkbox
                                                checked={form.estado_publi_problemas?.includes(problema) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            estado_publi_problemas: [
                                                                ...(prev.estado_publi_problemas || []),
                                                                problema,
                                                            ],
                                                        }));
                                                    } else {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            estado_publi_problemas: (
                                                                prev.estado_publi_problemas || []
                                                            ).filter((item) => item !== problema),
                                                        }));
                                                    }
                                                }}
                                            />
                                        }
                                        label={problema}
                                    />
                                ))}
                            </FormGroup>
                        </div>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

const INCENTIVOS = [
    "BONO EN EFECTIVO",
    "CELULAR",
    "TV",
    "ARTICULO DE LÍNEA BLANCA",
    "BICICLETA",
    "TABLET",
    "NOTEBOOK",
    "GIF CARD",
    "BONO CANJEABLE",
    "SOUVENIR DE MARCA",
    "OTROS"
];


function EncuestaInteraccion({ form,setForm, handleChange , disabled }) {
    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography fontWeight="bold">Interacción con vendedores y jefes de tienda</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    <RadioEscala
                        label="9. ¿Cuál es la conformidad de los vendedores de piso con el incentivo actual de Shineray? *"
                        value={form.confor_shine_ven || ''}
                        onChange={handleChange('confor_shine')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO ACTUALMENTE"
                    />
                    <RadioEscala
                        label="10. ¿Cuál es la conformidad del jefe de tienda con el incentivo actual de Shineray? *"
                        value={form.confor_shine_jef || ''}
                        onChange={handleChange('confor_shine')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO ACTUALMENTE"
                    />
                    <RadioEscala
                        label="11. ¿Cuál es la conformidad de los vendedores de piso  con el incentivo actual de la competencia?  "
                        value={form.confor_compe_ven || ""}
                        onChange={handleChange("confor_compe_ven")}
                        required
                        disabled={disabled}
                        showNA
                        naLabel="NO HAY INCENTIVO"
                    />
                    {form.confor_compe_ven && parseInt(form.confor_compe_ven, 10) >= 3 && (
                        <FormGroup sx={{ mt: 2 }}>
                            {INCENTIVOS.map((incentivo) => (
                                <div key={incentivo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={form.incentivos_ven?.includes(incentivo) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            incentivos_ven: [...(prev.incentivos_ven || []), incentivo],
                                                        }));
                                                    } else {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            incentivos_ven: (prev.incentivos_ven || []).filter(
                                                                (item) => item !== incentivo
                                                            ),
                                                            ...(incentivo === "BONO EN EFECTIVO"
                                                                ? { bono_efectivo_valor: "" }
                                                                : {}),
                                                            ...(incentivo === "OTROS"
                                                                ? { incentivos_ven_otros: "" }
                                                                : {}),
                                                        }));
                                                    }
                                                }}
                                            />
                                        }
                                        label={incentivo}
                                    />
                                    {incentivo === "BONO EN EFECTIVO" &&
                                        form.incentivos_ven?.includes("BONO EN EFECTIVO") && (
                                            <TextField
                                                type="number"
                                                label="Cantidad"
                                                value={form.bono_efectivo_valor || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        bono_efectivo_valor: e.target.value,
                                                    }))
                                                }
                                                size="small"
                                                sx={{ mt: 1, ml: 4, width: 110 }}
                                                inputProps={{ step: "0.01", min: 0 }}
                                            />
                                        )}
                                    {incentivo === "OTROS" &&
                                        form.incentivos_ven?.includes("OTROS") && (
                                            <TextField
                                                label="Especifique otro incentivo"
                                                value={form.incentivos_ven_otros || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        incentivos_ven_otros: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                size="small"
                                                sx={{ mt: 1, ml: 4, width: 200 }}
                                            />
                                        )}
                                </div>
                            ))}
                        </FormGroup>
                    )}
                    <RadioEscala
                        label="12. ¿Cuál es la conformidad del jefe de tienda con el incentivo actual de la competencia?  "
                        value={form.confor_compe_jef || ""}
                        onChange={handleChange("confor_compe_jef")}
                        required
                        disabled={disabled}
                        showNA
                        naLabel="NO HAY INCENTIVO"
                    />
                    {form.confor_compe_jef && parseInt(form.confor_compe_jef, 10) >= 3 && (
                        <FormGroup sx={{ mt: 2 }}>
                            {INCENTIVOS.map((incentivo) => (
                                <div key={incentivo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={form.incentivos_jef?.includes(incentivo) || false}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            incentivos_jef: [...(prev.incentivos_jef || []), incentivo],
                                                        }));
                                                    } else {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            incentivos_jef: (prev.incentivos_jef || []).filter(
                                                                (item) => item !== incentivo
                                                            ),
                                                            ...(incentivo === "BONO EN EFECTIVO"
                                                                ? { bono_efectivo_valor: "" }
                                                                : {}),
                                                            ...(incentivo === "OTROS"
                                                                ? { incentivos_jef_otros: "" }
                                                                : {}),
                                                        }));
                                                    }
                                                }}
                                            />
                                        }
                                        label={incentivo}
                                    />
                                    {incentivo === "BONO EN EFECTIVO" &&
                                        form.incentivos_jef?.includes("BONO EN EFECTIVO") && (
                                            <TextField
                                                type="number"
                                                label="Cantidad"
                                                value={form.bono_efectivo_valor || ""}
                                                onChange={(e) => {
                                                    let value = e.target.value;
                                                    if (value && !isNaN(value)) {
                                                        const parts = value.split(".");
                                                        if (parts[1]?.length > 2) {
                                                            value = `${parts[0]}.${parts[1].slice(0, 2)}`;
                                                        }
                                                    }
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        bono_efectivo_valor: value,
                                                    }));
                                                }}
                                                size="small"
                                                sx={{ mt: 1, ml: 4, width: 110 }}
                                                inputProps={{ step: "0.01", min: 0 }}
                                            />
                                        )}
                                    {incentivo === "OTROS" &&
                                        form.incentivos_jef?.includes("OTROS") && (
                                            <TextField
                                                label="Especifique otro incentivo"
                                                value={form.incentivos_jef_otros || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        incentivos_jef_otros: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                size="small"
                                                sx={{ mt: 1, ml: 4, width: 200 }}
                                            />
                                        )}
                                </div>
                            ))}
                        </FormGroup>
                    )}
                    <RadioEscala label="13. Califique el conocimiento sobre el Shibot  que tienen los vendedores de piso" value={form.conoc_shibot || ''} onChange={handleChange('conoc_shibot')} required disabled={disabled}/>
                    <RadioSiNo label="14. ¿Conocen los vendedores de piso la ubicación de talleres autorizados cercanos?" value={form.ubi_talleres || ''} onChange={handleChange('ubi_talleres')} required disabled={disabled}/>
                    <RadioEscala label="15. Califique el conocimiento del portafolio que tienen los vendedores de piso" value={form.conoc_portaf || ''} onChange={handleChange('conoc_portaf')} required disabled={disabled} />
                    <RadioEscala label="16. Califique el conocimiento del producto que tienen los vendedores de piso"   value={form.conoc_prod   || ''} onChange={handleChange('conoc_prod')} required  disabled={disabled}/>
                    <RadioEscala label="17. Califique el conocimiento de garantías y postventa que tienen los vendedores de piso" value={form.conoc_garan || ''} onChange={handleChange('conoc_garan')} required disabled={disabled} />
                    <EncuestaForm
                        label="18. ¿Existe promocional actual de la marca? (Dirigido al cliente final) *"
                        value={form.existe_promo || ''}
                        onChange={handleChange('existe_promo')}
                        naLabel="NO HAY PROMOCIONAL"
                        disabled={disabled}
                    />
                    {form.existe_promo === 'SI' && (
                        <Grid item xs={12}>
                            <EncuestaForm
                                label="18.1. ¿Tienen los vendedores de piso conocimiento de promocional actual de la marca? (Dirigido al cliente final) *"
                                value={form.conoc_promo || ''}
                                onChange={handleChange('conoc_promo')}
                                disabled={disabled}
                            />
                        </Grid>
                    )}

                </Box>
            </AccordionDetails>
        </Accordion>
    );
}


export { EncuestaExhibicion, EncuestaInteraccion };
