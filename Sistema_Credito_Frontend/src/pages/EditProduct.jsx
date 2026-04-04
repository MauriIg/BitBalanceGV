import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "./AddProduct.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);

  // Obtener producto existente
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${id}`);
        const producto = res.data;

setForm({
  ...producto,
  edad: producto.edad ? producto.edad.toString() : "",
  categoria: producto.categoria?._id || producto.categoria
});
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el cliente.");
      }
    };

    const fetchCategorias = async () => {
      try {
        const res = await axiosInstance.get("/api/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al cargar categorías", err);
      }
    };

    fetchProduct();
    fetchCategorias();
  }, [id]);

  // Manejo de inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCodigoChange = (e, index) => {
    const nuevosCodigos = [...form.codigos];
    nuevosCodigos[index] = e.target.value;
    setForm((prev) => ({ ...prev, codigos: nuevosCodigos }));
  };

  const handleReferenciaChange = (index, e) => {
    const nuevasReferencias = [...(form.referencias || [])];
    nuevasReferencias[index][e.target.name] = e.target.value;
  
    setForm((prev) => ({
      ...prev,
      referencias: nuevasReferencias
    }));
  };

  const agregarReferencia = () => {
    setForm((prev) => ({
      ...prev,
      referencias: [
        ...(prev.referencias || []),
        { nombre: "", telefono: "", parentesco: "" }
      ]
    }));
  };

  const agregarCodigo = () => {
    setForm((prev) => ({ ...prev, codigos: [...(prev.codigos || []), ""] }));
  };

  // Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/products/${id}`, {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
      });

      alert("Cliente actualizado");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar cliente.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!form) return <p>Cargando...</p>;

  return (
    <div className="form-container">
      <h2 className="form-title">Editar Cliente</h2>
    

      <form onSubmit={handleSubmit} className="form-grid">

        <div className="form-group">
          <label>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Edad</label>
          <input
            name="edad"
            value={form.edad}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
  <label>Estado Civil</label>
  <select
    name="estadoCivil"
    value={form.estadoCivil || "Soltero/a"}
    onChange={handleChange}
  >
    <option value="Soltero/a">Soltero/a</option>
    <option value="Casado/a">Casado/a</option>
    <option value="Viudo/a">Viudo/a</option>
    <option value="Divorciado/a">Divorciado/a</option>
    <option value="Separado/a">Separado/a</option>
    <option value="unionLibre">Unión libre</option>
  </select>
</div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            name="telefono"
            type="number"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Barrio / Colonia</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un Barrio o Colonia</option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
  <label>Ocupación</label>
  <input
    name="ocupacion"
    value={form.ocupacion || ""}
    onChange={handleChange}
    placeholder="Ej. Albañil, Comerciante..."
  />
</div>

<div className="form-group">
  <label>Tiempo viviendo en la casa</label>
  <input
    name="tiempoViviendo"
    value={form.tiempoViviendo || ""}
    onChange={handleChange}
    placeholder="Ej. 2 años, 6 meses..."
  />
</div>

<div className="form-group">
  <label>Tipo de vivienda</label>
  <select
    name="tipoVivienda"
    value={form.tipoVivienda || "rentada"}
    onChange={handleChange}
  >
    <option value="propia">Propia</option>
    <option value="rentada">Rentada</option>
    <option value="prestada">Prestada</option>
  </select>
</div>

<div className="form-group">
  <label>Ubicación (Google Maps)</label>
  <input
    name="ubicacionGPS"
    value={form.ubicacionGPS || ""}
    onChange={handleChange}
    placeholder="https://maps.google.com/..."
  />
</div>

        <div className="form-group">
          <label>Monto Con interes</label>
          <input
            name="precio"
            type="number"
            value={form.precio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Monto Solicitado</label>
          <input
            name="montoSolicitado"
            type="number"
            value={form.montoSolicitado}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Semanas de Pago</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Documentación (URL)</label>
          <input
            name="documentacion"
            value={form.documentacion}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Imagen (URL)</label>
          <input
            name="imagen"
            value={form.imagen}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Direcciones / Referencias</label>

          {form.codigos?.map((c, i) => (
            <input
              key={i}
              value={c}
              onChange={(e) => handleCodigoChange(e, i)}
              placeholder={`Referencia ${i + 1}`}
              style={{ marginBottom: "6px" }}
            />
          ))}

          <button
            type="button"
            onClick={agregarCodigo}
            style={{ marginTop: "6px" }}
          >
            Agregar referencia
          </button>
        </div>

        <div className="form-group">
  <label>Contactos de Referencia</label>

  {form.referencias?.map((ref, i) => (
    <div key={i} style={{marginBottom:"10px"}}>

      <input
        name="nombre"
        value={ref.nombre}
        onChange={(e) => handleReferenciaChange(i, e)}
        placeholder="Nombre"
        style={{marginBottom:"5px"}}
      />

      <input
        name="telefono"
        value={ref.telefono}
        onChange={(e) => handleReferenciaChange(i, e)}
        placeholder="Teléfono"
        style={{marginBottom:"5px"}}
      />

      <input
        name="parentesco"
        value={ref.parentesco}
        onChange={(e) => handleReferenciaChange(i, e)}
        placeholder="Parentesco"
        style={{marginBottom:"5px"}}
      />

    </div>
  ))}

  <button
    type="button"
    onClick={agregarReferencia}
  >
    Agregar referencia
  </button>

</div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="favorito"
            checked={form.favorito}
            onChange={handleChange}
          />
          <label>Buen pagador</label>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            name="visible"
            checked={form.visible}
            onChange={handleChange}
          />
          <label>Activo</label>
        </div>

        <div className="form-group">
            <label>Fecha de Desembolso</label>
            <input
              type="date"
              name="fechaRegistro"
              value={form.fechaRegistro ? form.fechaRegistro.substring(0, 10) : ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
  <label>Dia de Pago:</label>
  <select
  name="diaPago"
  value={form.diaPago || ""}
  onChange={handleChange}
>
    <option value="Domingo">Domingo</option>
    <option value="Lunes">Lunes</option>
    <option value="Martes">Martes</option>
    <option value="Miercoles">Miercoles</option>
    <option value="Jueves">Jueves</option>
    <option value="Viernes">Viernes</option>
    <option value="Sabado">Sabado</option>
  </select>
</div> 

        <button type="submit" className="submit-btn">
          Guardar Cambios
        </button>

      </form>
    </div>
  );
};

export default EditProduct;