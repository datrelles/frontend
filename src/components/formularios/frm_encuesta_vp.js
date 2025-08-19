/// ********************* MODULO PARA CREACION DE ENCUESTAS PARA CADENAS Y MAYOREO
import { Box, Typography, TextField,
    FormControl, RadioGroup, Radio,
    FormControlLabel, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Grid} from "@material-ui/core";

function RadioEscala({ label, value, onChange, required = false, showNA = false, naLabel = "N/A", disabled = false }) {
    return (
        <Grid container alignItems="center" spacing={2}>
            <Grid item xs={5}>
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
            <Grid item xs={7}>
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
            <Grid item xs={5}>
                <Typography sx={{ whiteSpace: "normal", fontSize: "16px" }}>
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={7}>
                <FormControl component="fieldset" fullWidth disabled={disabled}>
                    <RadioGroup row value={value} onChange={onChange}>
                        <FormControlLabel
                            value="SI"
                            control={<Radio size="small" disabled={disabled} sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                            label="SI"
                            sx={{ mx: 1 }}
                        />
                        <FormControlLabel
                            value="NO"
                            control={<Radio size="small" disabled={disabled} sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
                            label="NO"
                            sx={{ mx: 1 }}
                        />
                        {naLabel && (
                            <FormControlLabel
                                value="N/A"
                                control={<Radio size="small" disabled={disabled} sx={{ '&.Mui-checked': { color: 'firebrick' } }} />}
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
            <Grid item xs={5}>
                <Typography sx={{ fontSize: "16px" }}>
                    {label}{required && ' *'}
                </Typography>
            </Grid>
            <Grid item xs={7} sx={{ display: "flex", alignItems: "center" }}>
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

function EncuestaExhibicion({ form, handleChange, esRetail, disabled }) {
    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography fontWeight="bold">Estado de la exhibición</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    <RadioEscala label="1. Limpio y ordenado *"
                                 value={form.limp_orden || ''} onChange={handleChange('limp_orden')} disabled={disabled} required />
                    <RadioSiNo label="2. Material POP actualizado *"
                               value={form.pop_actual || ''} onChange={handleChange('pop_actual')} disabled={disabled} />
                    {form.pop_actual === 'NO' && (
                        <TextField label="Observaciones"
                                   value={form.pop_actual_obs || ''}
                                   onChange={(e) => handleChange('pop_actual_obs')({ target: { value: e.target.value.toUpperCase() } })}
                                   required fullWidth />
                    )}
                    <CampoTexto
                        label="3. Material POP suficiente (%) "
                        value={form.pop_sufic ?? ''}
                        onChange={(e) => handleChange('pop_sufic')({ target: { value: e.target.value } })}
                        type="number"
                        required
                        disabled={disabled}
                        placeholder="%"
                    />
                    {esRetail && (
                        <RadioEscala
                            label="4. Precios visibles y correctos"
                            value={form.prec_vis_corr || ''}
                            onChange={handleChange('prec_vis_corr')}
                            required
                            showNA
                            naLabel="NO APLICA"
                            disabled={disabled}
                        />
                    )}
                    <RadioSiNo label="5. Existen motos con imperfectos"
                               value={form.motos_desper || ''} onChange={handleChange('motos_desper')} disabled={disabled} />
                    {form.motos_desper === 'SI' && (
                        <TextField label="Observaciones"
                                   value={form.motos_desper_obs || ''}
                                   onChange={(e) => handleChange('motos_desper_obs')({ target: { value: e.target.value.toUpperCase() } })}
                                   required fullWidth
                                   disabled={disabled}/>
                    )}
                    <RadioSiNo
                        label="6. Estado de publicidad de la marca"
                        value={form.estado_publi || ''}
                        onChange={handleChange('estado_publi')}
                        naLabel="NO HAY PUBLICIDAD"
                        disabled={disabled}
                    />
                    {form.estado_publi === 'NO' && (
                        <TextField
                            label="Observaciones"
                            value={form.estado_publi_obs || ''}
                            onChange={(e) => handleChange('estado_publi_obs')({
                                target: { value: e.target.value.toUpperCase() }
                            })}
                            required
                            fullWidth
                            disabled={disabled}
                        />
                    )}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

function EncuestaInteraccion({ form, handleChange , disabled }) {
    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f5f5f5' }}>
                <Typography fontWeight="bold">Interacción con vendedores y jefes de tienda</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={2}>
                    <RadioEscala label="7. Conocimiento del portafolio" value={form.conoc_portaf || ''} onChange={handleChange('conoc_portaf')} required disabled={disabled} />
                    <RadioEscala label="8. Conocimiento del producto"   value={form.conoc_prod   || ''} onChange={handleChange('conoc_prod')} required  disabled={disabled}/>
                    <RadioEscala label="9. Conocimiento de garantía y postventa" value={form.conoc_garan || ''} onChange={handleChange('conoc_garan')} required disabled={disabled} />

                    <RadioSiNo
                        label="10. Conocimiento de promocional actual"
                        value={form.conoc_promo || ''}
                        onChange={handleChange('conoc_promo')}
                        naLabel="NO HAY PROMOCIONAL"
                        disabled={disabled}
                    />
                    <RadioEscala
                        label="11. Conformidad incentivo Shineray"
                        value={form.confor_shine || ''}
                        onChange={handleChange('confor_shine')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO ACTUALMENTE"
                    />
                    <RadioEscala
                        label="12. Conformidad incentivo competencia"
                        value={form.confor_compe || ''}
                        onChange={handleChange('confor_compe')}
                        showNA
                        disabled={disabled}
                        naLabel="NO HAY INCENTIVO"
                    />
                    {form.confor_compe && form.confor_compe !== 'N/A' && (
                        <TextField
                            label="Detalle de incentivos"
                            value={form.confor_compe_obs || ''}
                            onChange={(e) => {
                                const uppercaseValue = e.target.value.toUpperCase();
                                handleChange('confor_compe_obs')({ target: { value: uppercaseValue } });
                            }}
                            fullWidth
                            disabled={disabled}
                        />
                    )}
                    <RadioEscala label="13. Conocimiento de shibot" value={form.conoc_shibot || ''} onChange={handleChange('conoc_shibot')} required disabled={disabled}/>
                    <RadioEscala label="14. Ubicación de talleres cercanos" value={form.ubi_talleres || ''} onChange={handleChange('ubi_talleres')} required disabled={disabled}/>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}


export { EncuestaExhibicion, EncuestaInteraccion };
