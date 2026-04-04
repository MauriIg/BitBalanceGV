// src/pages/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNewProduct } from "../redux/slices/productSlice";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import "./AddProduct.css";

const AddProduct = () => {
  const [producto, setProducto] = useState({
    nombre: "",
    edad: "",
    estadoCivil:"Soltero/a",
    codigos: "",
    telefono: "",
    ocupacion:"",
    tiempoViviendo:"",
    tipoVivienda:"rentada",
    ubicacionGPS:"",
    categoria: "",
    precio: "",
    montoSolicitado:"",
    stock: "",
    imagen: "",
    documentacion: "",
    favorito: false,
    visible: true,
    fechaRegistro: "",
    diaPago:"",
    referencias: [
      { nombre: "", telefono: "", parentesco: "" },
      { nombre: "", telefono: "", parentesco: "" }
    ]
  });

  const [categorias, setCategorias] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await axiosInstance.get("/api/categorias");
        setCategorias(res.data);
      } catch (err) {
        console.error("Error al obtener categorías:", err);
      }
    };

    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const handleReferenciaChange = (index, e) => {
    const nuevasReferencias = [...producto.referencias];
    nuevasReferencias[index][e.target.name] = e.target.value;
  
    setProducto({
      ...producto,
      referencias: nuevasReferencias
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Debes iniciar sesión para agregar un producto.");
      return;
    }

    try {
      await dispatch(
        addNewProduct({
          ...producto,
          codigos: producto.codigos.split(",").map(c => c.trim()), // ✅ convierte en array
          precio: parseFloat(producto.precio),
          montoSolicitado: parseFloat(producto.montoSolicitado),
          stock: parseInt(producto.stock),
        })
      ).unwrap();

      navigate("/products");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      alert("Error al agregar el producto. Ver consola.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Registrar Cliente</h2>
  
      {!isAuthenticated ? (
        <p>Debes iniciar sesión para agregar productos.</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-grid">
  
          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              name="nombre"
              value={producto.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input
              type="text"
              name="edad"
              value={producto.edad || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
  <label>Estado Civil</label>
  <select
  name="estadoCivil"
  value={producto.estadoCivil || "Soltero/a"}
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
              type="text"
              name="telefono"
              value={producto.telefono}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="form-group">
            <label>Dirección y Referencias</label>
            <input
              type="text"
              name="codigos"
              value={producto.codigos}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="form-group">
            <label>Barrio / Colonia</label>
            <select
              name="categoria"
              value={producto.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una opción</option>
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
    type="text"
    name="ocupacion"
    value={producto.ocupacion}
    onChange={handleChange}
    placeholder="Ej. Albañil, Comerciante..."
  />
</div>

<div className="form-group">
  <label>Tiempo viviendo en la casa</label>
  <input
    type="text"
    name="tiempoViviendo"
    value={producto.tiempoViviendo}
    onChange={handleChange}
    placeholder="Ej. 2 años, 6 meses..."
  />
</div>

<div className="form-group">
  <label>Tipo de vivienda</label>
  <select
  name="tipoVivienda"
    value={producto.tipoVivienda}
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
    type="text"
    name="ubicacionGPS"
    value={producto.ubicacionGPS}
    onChange={handleChange}
    placeholder="Pega el link de Google Maps"
  />
</div>
          
  
<div className="form-group">
            <label>Monto inicial</label>
            <input
              type="number"
              name="precio"
              value={producto.precio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Monto a incrementar</label>
            <input
              type="number"
              name="montoSolicitado"
              value={producto.montoSolicitado}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="form-group">
            <label>Semanas de Cobro</label>
            <input
              type="number"
              name="stock"
              value={producto.stock}
              onChange={handleChange}
              required
            />
          </div>


{producto.referencias.map((ref, index) => (
  <div key={index} className="referencia-box">

    <div className="form-group">
      <label>Nombre de Referencia {index + 1}</label>
      <input
        type="text"
        name="nombre"
        value={ref.nombre}
        onChange={(e) => handleReferenciaChange(index, e)}
      />
    </div>

    <div className="form-group">
      <label>Teléfono</label>
      <input
        type="text"
        name="telefono"
        value={ref.telefono}
        onChange={(e) => handleReferenciaChange(index, e)}
      />
    </div>

    <div className="form-group">
      <label>Parentesco</label>
      <input
        type="text"
        name="parentesco"
        value={ref.parentesco}
        onChange={(e) => handleReferenciaChange(index, e)}
      />
    </div>

  </div>
))}

          <div className="form-group">
            <label>Imagen (URL)</label>
            <input
              type="text"
              name="imagen"
              value={producto.imagen}
              onChange={handleChange}
            />
          </div>
  
          <div className="form-group">
            <label>Documentación (URL)</label>
            <input
              type="text"
              name="documentacion"
              value={producto.documentacion}
              onChange={handleChange}
            />
          </div>
  
          <div className="form-group">
            <label>Fecha de Desembolso</label>
            <input
              type="date"
              name="fechaRegistro"
              value={producto.fechaRegistro}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
  <label>Dia de Pago</label>
  <select
  name="diaPago"
  value={producto.diaPago || ""}
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
  
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              name="favorito"
              checked={producto.favorito}
              onChange={(e) =>
                setProducto({ ...producto, favorito: e.target.checked })
              }
            />
            <label>Pagador Puntual</label>
          </div>
  
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              name="visible"
              checked={producto.visible}
              onChange={(e) =>
                setProducto({ ...producto, visible: e.target.checked })
              }
            />
            <label>Visible</label>
          </div>
  
          <button type="submit" className="submit-btn">
            Registrar Cliente
          </button>
  
        </form>
      )}
    </div>
  );
};

export default AddProduct;
