// models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Nombre del producto
    nombre: { type: String, required: true },

    // Edad del cliente
    edad: { type: String, required: false },

    estadoCivil: {
      type: String,
      enum: [ "Soltero/a", "Casado/a", "Viudo/a", "Divorciado/a", "Separado/a", "unionLibre"],
      default: "Soltero/a"
    },

    // Código del producto con validación de formato alfanumérico
    codigos: [{ 
      type: String,
      match: /^[a-zA-Z0-9\s.,#-]+$/,
    }],
    

    // Categoría del producto
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
  required: false,
  default: null
    },

    telefono: {
      type: String,
      required: true,
      trim: true
    },
    
    // 👇 Información adicional del cliente
ocupacion: {
  type: String,
  trim: true
},

tiempoViviendo: {
  type: String, // ejemplo: "2 años", "6 meses"
  trim: true
},

tipoVivienda: {
  type: String,
  enum: ["propia", "rentada", "prestada"],
  default: "rentada"
},

ubicacionGPS: {
  type: String // aquí puedes guardar un link de Google Maps
},
    // Precio del producto con validación para evitar valores negativos
    precio: { 
      type: Number, 
      required: true, 
      min: [0, 'El precio no puede ser negativo'] 
    },

    montoSolicitado: { 
      type: Number, 
      required: true, 
      min: [0, 'El precio no puede ser negativo'] 
    },

    // Stock disponible del producto
    stock: { 
      type: Number, 
      required: true, 
      min: [0, 'El stock no puede ser negativo'] 
    },

    // Saldo pendiente del crédito
saldoRestante: {
  type: Number,
  required: true,
  min: 0
},
    
    // Proveedor asignado
proveedor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // usuario con rol proveedor
  required: false
},

    // Imagen del producto (URL)
    imagen: { type: String, required: false },
        // Documentación del producto (URL)
        documentacion: { type: String, required: false },

        referencias: [
          {
            nombre: {
              type: String,
              trim: true
            },
            telefono: {
              type: String,
              trim: true
            },
            parentesco: {
              type: String,
              trim: true
            }
          }
        ],

    // Indica si el producto es favorito o no
    favorito: { type: Boolean, default: false },

    // Visibilidad del producto en el catálogo
    visible: { type: Boolean, default: true }, // Si se muestra en el catÃ¡logo

    // 👇 NUEVO CAMPO
    fechaRegistro: {
      type: Date,
      default: Date.now
    },

    diaPago: {
      type: String,
      enum: ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"]
    },

    estadoColor: {
      type: String,
      default: ""
    }
  },
  { timestamps: true } // Agrega createdAt y updatedAt
);

// Crea el modelo "Product" a partir del esquema
const Product = mongoose.model("Product", productSchema);
export default Product;