/// ********************* MODULO PARA CREACION DE ENCUESTAS PARA CADENAS Y MAYOREO
import { Box, Typography, TextField,
    FormControl, RadioGroup, Radio,
    FormControlLabel, Accordion, AccordionSummary, AccordionDetails,FormGroup, Checkbox } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Grid} from "@material-ui/core";
import useOpcionesPregunta from "../formularios/useOpcionesPregunta";

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

const agruparOpciones = (opciones) => {
    const grupos = {
        Daños: [],
        Oxidación: [],
        Llantas: [],
        Retrovisores: [],
        Asiento: [],
        Otros: []
    };

    opciones.forEach((opt) => {
        const text = opt.texto.toLowerCase();

        if (text.includes("golpe") || text.includes("hundido") || text.includes("pelada") || text.includes("rayado") || text.includes("plástico")) {
            grupos.Daños.push(opt);
        } else if (text.includes("oxid")) {
            grupos.Oxidación.push(opt);
        } else if (text.includes("llanta")) {
            grupos.Llantas.push(opt);
        } else if (text.includes("retrovisor")) {
            grupos.Retrovisores.push(opt);
        } else if (text.includes("asiento")) {
            grupos.Asiento.push(opt);
        } else {
            grupos.Otros.push(opt);
        }
    });

    return grupos;
};

function EncuestaExhibicion({ form, setForm, handleChange, disabled ,APIService}) {

    const { opciones: opcionesPop, loading: loadingPop } = useOpcionesPregunta(APIService, 2);
    const { opciones: opcionesDanos, loading: loadingDanos } = useOpcionesPregunta(APIService, 5);
    const { opciones: opcionesFaltantes, loading: loadingFaltantes } = useOpcionesPregunta(APIService, 6);
    const { opciones: opcionesBateria, loading: loadingBateria } = useOpcionesPregunta(APIService, 7);
    const { opciones: opcionesPubli, loading: loadingPubli } = useOpcionesPregunta(APIService, 8);

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
                        <FormGroup>
                            {opcionesPop.map((material) => (
                                <div key={material.codigo}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={
                                                    form.pop_material_desactualizado?.some((i) => i.codigo === material.codigo) || false
                                                }
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setForm((prev) => {
                                                        const current = prev.pop_material_desactualizado || [];
                                                        return {
                                                            ...prev,
                                                            pop_material_desactualizado: isChecked
                                                                ? [...current, material]
                                                                : current.filter((i) => i.codigo !== material.codigo),
                                                            ...(material.texto === "Otros" && !isChecked
                                                                ? { otros_pop_material: "" }
                                                                : {}),
                                                        };
                                                    });
                                                }}
                                            />
                                        }
                                        label={material.texto}
                                    />
                                    {material.texto === "Otros" &&
                                        form.pop_material_desactualizado?.some((i) => i.codigo === material.codigo) && (
                                            <TextField
                                                label="Especifique otro material"
                                                value={form.otros_pop_material || ""}
                                                onChange={(e) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        otros_pop_material: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                fullWidth
                                                size="small"
                                                sx={{ mt: 1, ml: 4, width: 200 }}
                                            />
                                        )}
                                </div>
                            ))}
                        </FormGroup>
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
                    <RadioSiNo
                        label="4. ¿Se encuentran los precios visibles y correctos?"
                        value={form.prec_vis_corr || ''}
                        onChange={handleChange('prec_vis_corr')}
                        required
                        showNA
                        naLabel="NO APLICA"
                        disabled={disabled}
                    />
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
                            {loadingDanos ? (
                                <Typography>Cargando opciones...</Typography>
                            ) : (
                                Object.entries(agruparOpciones(opcionesDanos)).map(([grupo, items]) =>
                                        items.length > 0 && (
                                            <div key={grupo} style={{ marginBottom: '16px' }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1, mb: 1 }}>
                                                    {grupo.toUpperCase()}
                                                </Typography>
                                                <Grid container spacing={2}>
                                                    {items.map((dano) => (
                                                        <Grid item xs={12} sm={6} md={4} key={dano.codigo}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={form.motos_desper_opciones?.some((i) => i.codigo === dano.codigo) || false}
                                                                        onChange={(e) => {
                                                                            const isChecked = e.target.checked;
                                                                            setForm((prev) => {
                                                                                const current = prev.motos_desper_opciones || [];
                                                                                return {
                                                                                    ...prev,
                                                                                    motos_desper_opciones: isChecked
                                                                                        ? [...current, dano]
                                                                                        : current.filter((i) => i.codigo !== dano.codigo),
                                                                                };
                                                                            });
                                                                        }}
                                                                    />
                                                                }
                                                                label={dano.texto}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </div>
                                        )
                                )
                            )}
                        </div>
                    )}
                    <RadioSiNo
                        label="6. ¿Existen motos con componentes faltantes? *"
                        value={form.motos_falt || ''}
                        onChange={handleChange('motos_falt')}
                        disabled={disabled}
                    />
                    {form.motos_falt === 'SI' && (
                        <FormGroup>
                            {opcionesFaltantes.map((comp) => (
                                <FormControlLabel
                                    key={comp.codigo}
                                    control={
                                        <Checkbox
                                            checked={form.motos_falt_opciones?.some((i) => i.codigo === comp.codigo) || false}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setForm((prev) => {
                                                    const current = prev.motos_falt_opciones || [];
                                                    return {
                                                        ...prev,
                                                        motos_falt_opciones: isChecked
                                                            ? [...current, comp]
                                                            : current.filter((i) => i.codigo !== comp.codigo),
                                                        ...(comp.texto === 'Otros' && !isChecked ? { motos_componentes_otros: '' } : {}),
                                                    };
                                                });
                                            }}
                                        />
                                    }
                                    label={comp.texto}
                                />
                            ))}
                        </FormGroup>
                    )}
                    <RadioSiNo
                        label="7. ¿La batería presenta algún problema? *"
                        value={form.motos_bat || ""}
                        onChange={handleChange("motos_bat")}
                        disabled={disabled}
                    />
                    {form.motos_bat === "SI" && (
                        <FormControl component="fieldset" disabled={disabled}>
                            <RadioGroup
                                value={form.estado_bateria?.codigo || ""}
                                onChange={(e) => {
                                    const selected = opcionesBateria.find(
                                        (opt) => String(opt.codigo) === e.target.value
                                    );
                                    setForm((prev) => ({
                                        ...prev,
                                        estado_bateria: selected || null,
                                    }));
                                }}
                            >
                                {opcionesBateria.map((opcion) => (
                                    <FormControlLabel
                                        key={opcion.codigo}
                                        value={opcion.codigo}
                                        control={<Radio />}
                                        label={opcion.texto}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>
                    )}
                    <RadioSiNo
                        label="8. ¿La publicidad/branding de la marca se encuentra actualizada y en buen estado? *"
                        value={form.estado_publi || ""}
                        onChange={handleChange("estado_publi")}
                        naLabel="NO HAY PUBLICIDAD"
                        disabled={disabled}
                    />
                    {form.estado_publi === "NO" && (
                        <div>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los problemas encontrados en la publicidad/branding:
                            </Typography>

                            {loadingPubli ? (
                                <Typography>Cargando opciones...</Typography>
                            ) : (
                                <FormGroup>
                                    {opcionesPubli.map((problema) => (
                                        <div key={problema.codigo}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            form.estado_publi_problemas?.some(
                                                                (i) => i.codigo === problema.codigo
                                                            ) || false
                                                        }
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setForm((prev) => {
                                                                const current = prev.estado_publi_problemas || [];
                                                                return {
                                                                    ...prev,
                                                                    estado_publi_problemas: isChecked
                                                                        ? [...current, problema] // guardamos {codigo, texto}
                                                                        : current.filter((i) => i.codigo !== problema.codigo),
                                                                    ...(problema.texto === "Otros" && !isChecked
                                                                        ? { estado_publi_otros: "" }
                                                                        : {}),
                                                                };
                                                            });
                                                        }}
                                                    />
                                                }
                                                label={problema.texto}
                                            />
                                            {problema.texto === "Otros" &&
                                                form.estado_publi_problemas?.some(
                                                    (i) => i.codigo === problema.codigo
                                                ) && (
                                                    <TextField
                                                        label="Especifique otro problema"
                                                        value={form.estado_publi_otros || ""}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                estado_publi_otros: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        fullWidth
                                                        size="small"
                                                        sx={{ mt: 1, ml: 4, width: 300 }}
                                                    />
                                                )}
                                        </div>
                                    ))}
                                </FormGroup>
                            )}
                        </div>
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

function EncuestaInteraccion({ form, setForm, handleChange, disabled, APIService }) {
    const { opciones: opcionesIncentivos, loading: loadingIncentivos } = useOpcionesPregunta(APIService, 11);
    const { opciones: opcionesIncentivosJefe, loading: loadingIncentivosJefe } = useOpcionesPregunta(APIService, 12);

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography fontWeight="bold">
                    Interacción con vendedores y jefes de tienda
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    <RadioEscala
                        label="9. ¿Cuál es la conformidad de los vendedores de piso con el incentivo actual de Shineray? *"
                        value={form.confor_shine_v || ''}
                        onChange={handleChange('confor_shine_v')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO ACTUALMENTE"
                    />
                    <RadioEscala
                        label="10. ¿Cuál es la conformidad del jefe de tienda con el incentivo actual de Shineray? *"
                        value={form.confor_shine_j || ''}
                        onChange={handleChange('confor_shine_j')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO ACTUALMENTE"
                    />
                    <RadioEscala
                        label="11. ¿Cuál es la conformidad de los vendedores de piso con el incentivo actual de la competencia?"
                        value={form.confor_compe_v || ""}
                        onChange={handleChange("confor_compe_v")}
                        required
                        disabled={disabled}
                        showNA
                        naLabel="NO HAY INCENTIVO"
                    />
                    {form.confor_compe_v && parseInt(form.confor_compe_v, 10) >= 3 && (
                        <>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los incentivos:
                            </Typography>

                            {loadingIncentivos ? (
                                <Typography>Cargando incentivos...</Typography>
                            ) : (
                                <FormGroup sx={{ mt: 2 }}>
                                    {opcionesIncentivos.map((incentivo) => (
                                        <div key={incentivo.codigo}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            form.incentivos_ven?.some((i) => i.codigo === incentivo.codigo) || false
                                                        }
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setForm((prev) => {
                                                                const current = prev.incentivos_ven || [];
                                                                return {
                                                                    ...prev,
                                                                    incentivos_ven: isChecked
                                                                        ? [...current, incentivo]
                                                                        : current.filter((i) => i.codigo !== incentivo.codigo),
                                                                    ...(incentivo.texto === "BONO EN EFECTIVO" && !isChecked
                                                                        ? { bono_efectivo_valor: "" }
                                                                        : {}),
                                                                    ...(incentivo.texto === "OTROS" && !isChecked
                                                                        ? { incentivos_ven_otros: "" }
                                                                        : {}),
                                                                };
                                                            });
                                                        }}
                                                    />
                                                }
                                                label={incentivo.texto}
                                            />
                                            {incentivo.texto === "BONO EN EFECTIVO" &&
                                                form.incentivos_ven?.some((i) => i.codigo === incentivo.codigo) && (
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
                                            {incentivo.texto === "OTROS" &&
                                                form.incentivos_ven?.some((i) => i.codigo === incentivo.codigo) && (
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
                        </>
                    )}
                    <RadioEscala
                        label="12. ¿Cuál es la conformidad del jefe de tienda con el incentivo actual de la competencia?"
                        value={form.confor_compe_j || ""}
                        onChange={handleChange("confor_compe_j")}
                        required
                        disabled={disabled}
                        showNA
                        naLabel="NO HAY INCENTIVO"
                    />
                    {form.confor_compe_j && parseInt(form.confor_compe_j, 10) >= 3 && (
                        <>
                            <Typography variant="subtitle1" gutterBottom>
                                Seleccione los incentivos:
                            </Typography>
                            {loadingIncentivosJefe ? (
                                <Typography>Cargando incentivos...</Typography>
                            ) : (
                                <FormGroup sx={{ mt: 2 }}>
                                    {opcionesIncentivosJefe.map((incentivoJefe) => (
                                        <div key={incentivoJefe.codigo}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            form.incentivos_jef?.some((i) => i.codigo === incentivoJefe.codigo) || false
                                                        }
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            setForm((prev) => {
                                                                const current = prev.incentivos_jef || [];
                                                                return {
                                                                    ...prev,
                                                                    incentivos_jef: isChecked
                                                                        ? [...current, incentivoJefe]
                                                                        : current.filter((i) => i.codigo !== incentivoJefe.codigo),
                                                                    ...(incentivoJefe.texto === "BONO EN EFECTIVO" && !isChecked
                                                                        ? { bono_efectivo_valor_jefe: "" }
                                                                        : {}),
                                                                    ...(incentivoJefe.texto === "OTROS" && !isChecked
                                                                        ? { incentivos_jefe_otros: "" }
                                                                        : {}),
                                                                };
                                                            });
                                                        }}
                                                    />
                                                }
                                                label={incentivoJefe.texto}
                                            />
                                            {incentivoJefe.texto === "BONO EN EFECTIVO" &&
                                                form.incentivos_jef?.some((i) => i.codigo === incentivoJefe.codigo) && (
                                                    <TextField
                                                        type="number"
                                                        label="Cantidad"
                                                        value={form.bono_efectivo_valor_jefe || ""}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                bono_efectivo_valor_jefe: e.target.value,
                                                            }))
                                                        }
                                                        size="small"
                                                        sx={{ mt: 1, ml: 4, width: 110 }}
                                                        inputProps={{ step: "0.01", min: 0 }}
                                                    />
                                                )}
                                            {incentivoJefe.texto === "OTROS" &&
                                                form.incentivos_jef?.some((i) => i.codigo === incentivoJefe.codigo) && (
                                                    <TextField
                                                        label="Especifique otro incentivo"
                                                        value={form.incentivos_jefe_otros || ""}
                                                        onChange={(e) =>
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                incentivos_jefe_otros: e.target.value.toUpperCase(),
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
                        </>
                    )}
                    <RadioEscala
                        label="13. Califique el conocimiento sobre el Shibot que tienen los vendedores de piso"
                        value={form.conoc_shibot || ''}
                        onChange={handleChange('conoc_shibot')}
                        required
                        disabled={disabled}
                    />
                    <RadioSiNo
                        label="14. ¿Conocen los vendedores de piso la ubicación de talleres autorizados cercanos?"
                        value={form.ubi_talleres || ''}
                        onChange={handleChange('ubi_talleres')}
                        required
                        disabled={disabled}
                    />
                    <RadioEscala
                        label="15. Califique el conocimiento del portafolio que tienen los vendedores de piso"
                        value={form.conoc_portaf || ''}
                        onChange={handleChange('conoc_portaf')}
                        required
                        disabled={disabled}
                    />
                    <RadioEscala
                        label="16. Califique el conocimiento del producto que tienen los vendedores de piso"
                        value={form.conoc_prod || ''}
                        onChange={handleChange('conoc_prod')}
                        required
                        disabled={disabled}
                    />
                    <RadioEscala
                        label="17. Califique el conocimiento de garantías y postventa que tienen los vendedores de piso"
                        value={form.conoc_garan || ''}
                        onChange={handleChange('conoc_garan')}
                        required
                        disabled={disabled}
                    />
                    <RadioSiNo
                        label="18. ¿Existe promocional actual de la marca? (Dirigido al cliente final) *"
                        value={form.existe_promo || ''}
                        onChange={handleChange('existe_promo')}
                        naLabel="NO HAY PROMOCIONAL"
                        disabled={disabled}
                    />
                    {form.existe_promo === 'SI' && (
                        <Grid item xs={12}>
                            <RadioSiNo
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
