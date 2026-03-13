const options = {
  definition: {
    // OpenAPI 3.0 - Sessions, Products, Carts
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Backend API',
      version: '1.0.0',
      description: 'API del proyecto final E-commerce: Sessions, Users, Products y Carts.'
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Servidor local' }
    ],
    tags: [
      { name: 'Sessions', description: 'Registro, login, sesión actual y logout' },
      { name: 'Products', description: 'Listado, creación, actualización y eliminación de productos' },
      { name: 'Carts', description: 'Carritos y compra' }
    ],
    paths: {
      '/api/sessions/register': {
        post: {
          tags: ['Sessions'],
          summary: 'Registrar usuario',
          description: 'Crea un usuario y un carrito vacío. La contraseña se hashea con bcrypt.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['first_name', 'last_name', 'email', 'age', 'password'],
                  properties: {
                    first_name: { type: 'string', example: 'Juan' },
                    last_name: { type: 'string', example: 'Pérez' },
                    email: { type: 'string', format: 'email', example: 'juan@test.com' },
                    age: { type: 'number', example: 25 },
                    password: { type: 'string', example: '123456' },
                    role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } } },
            400: { description: 'Faltan campos o email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/sessions/login': {
        post: {
          tags: ['Sessions'],
          summary: 'Iniciar sesión',
          description: 'Devuelve el usuario y setea una cookie HTTP-only con el JWT.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login exitoso',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      user: { $ref: '#/components/schemas/UserPublic' }
                    }
                  }
                }
              }
            },
            400: { description: 'Email y password requeridos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/sessions/current': {
        get: {
          tags: ['Sessions'],
          summary: 'Usuario actual',
          description: 'Requiere cookie con JWT. Devuelve el usuario asociado al token (DTO sin datos sensibles).',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Usuario actual', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/sessions/logout': {
        post: {
          tags: ['Sessions'],
          summary: 'Cerrar sesión',
          description: 'Limpia la cookie del token.',
          responses: {
            200: { description: 'Sesión cerrada', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } }
          }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Listar productos',
          description: 'Listado paginado. Query: limit, page, query (categoría o disponibilidad), sort (asc|desc por precio).',
          parameters: [
            { in: 'query', name: 'limit', schema: { type: 'integer' }, description: 'Items por página' },
            { in: 'query', name: 'page', schema: { type: 'integer' }, description: 'Página' },
            { in: 'query', name: 'query', schema: { type: 'string' }, description: 'Categoría o available/unavailable' },
            { in: 'query', name: 'sort', schema: { type: 'string', enum: ['asc', 'desc'] }, description: 'Orden por precio' }
          ],
          responses: {
            200: {
              description: 'Listado paginado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      payload: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                      totalPages: { type: 'integer' },
                      page: { type: 'integer' },
                      hasPrevPage: { type: 'boolean' },
                      hasNextPage: { type: 'boolean' },
                      prevLink: { type: 'string', nullable: true },
                      nextLink: { type: 'string', nullable: true }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Products'],
          summary: 'Crear producto',
          description: 'Solo administrador. Requiere JWT en cookie.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'code', 'price', 'stock', 'category'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    code: { type: 'string' },
                    price: { type: 'number', minimum: 0 },
                    status: { type: 'boolean', default: true },
                    stock: { type: 'number', minimum: 0 },
                    category: { type: 'string' },
                    thumbnails: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            400: { description: 'Campos faltantes o inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Solo administrador', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/products/{pid}': {
        get: {
          tags: ['Products'],
          summary: 'Obtener producto por ID',
          parameters: [{ in: 'path', name: 'pid', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Producto', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['Products'],
          summary: 'Actualizar producto',
          description: 'Solo administrador. Requiere JWT en cookie.',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'pid', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    code: { type: 'string' },
                    price: { type: 'number' },
                    status: { type: 'boolean' },
                    stock: { type: 'number' },
                    category: { type: 'string' },
                    thumbnails: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Producto actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Solo administrador', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Eliminar producto',
          description: 'Solo administrador. Requiere JWT en cookie.',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'pid', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Producto eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
            404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Solo administrador', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/carts': {
        post: {
          tags: ['Carts'],
          summary: 'Crear carrito',
          description: 'Crea un carrito vacío.',
          responses: {
            201: { description: 'Carrito creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } }
          }
        }
      },
      '/api/carts/{cid}': {
        get: {
          tags: ['Carts'],
          summary: 'Obtener carrito',
          description: 'Lista los productos del carrito (con populate).',
          parameters: [{ in: 'path', name: 'cid', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Carrito', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        put: {
          tags: ['Carts'],
          summary: 'Actualizar carrito completo',
          description: 'Body: { products: [{ product: id, quantity: n }, ...] }',
          parameters: [{ in: 'path', name: 'cid', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: { type: 'object', properties: { product: { type: 'string' }, quantity: { type: 'integer' } } }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Carrito actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Carts'],
          summary: 'Vaciar carrito',
          description: 'Elimina todos los productos del carrito.',
          parameters: [{ in: 'path', name: 'cid', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Carrito vaciado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/carts/{cid}/product/{pid}': {
        post: {
          tags: ['Carts'],
          summary: 'Agregar producto al carrito',
          description: 'Requiere JWT (usuario, no admin). Solo el dueño del carrito. Si el producto ya está, incrementa cantidad.',
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: 'path', name: 'cid', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'pid', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Carrito actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito o producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Solo usuario y carrito propio', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/carts/{cid}/products/{pid}': {
        put: {
          tags: ['Carts'],
          summary: 'Actualizar cantidad de producto en el carrito',
          description: 'Body: { quantity: number }',
          parameters: [
            { in: 'path', name: 'cid', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'pid', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { quantity: { type: 'integer', minimum: 0 } } }
              }
            }
          },
          responses: {
            200: { description: 'Carrito actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito o producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        },
        delete: {
          tags: ['Carts'],
          summary: 'Eliminar producto del carrito',
          parameters: [
            { in: 'path', name: 'cid', required: true, schema: { type: 'string' } },
            { in: 'path', name: 'pid', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: { description: 'Carrito actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Cart' } } } },
            404: { description: 'Carrito o producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/carts/{cid}/purchase': {
        post: {
          tags: ['Carts'],
          summary: 'Finalizar compra',
          description: 'Requiere JWT. Genera ticket y descuenta stock. Solo el dueño del carrito.',
          security: [{ cookieAuth: [] }],
          parameters: [{ in: 'path', name: 'cid', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Compra exitosa',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      ticket: { type: 'object', properties: { code: { type: 'string' }, amount: { type: 'number' }, purchaser: { type: 'string' } } },
                      unprocessedIds: { type: 'array', items: { type: 'string' }, description: 'IDs de productos sin stock suficiente' }
                    }
                  }
                }
              }
            }
          },
            404: { description: 'Carrito no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            401: { description: 'No autorizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            403: { description: 'Solo carrito propio', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
      }
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT en cookie (seteada tras login)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } }
        },
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            email: { type: 'string' },
            age: { type: 'number' },
            cart: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            code: { type: 'string' },
            price: { type: 'number' },
            status: { type: 'boolean' },
            stock: { type: 'number' },
            category: { type: 'string' },
            thumbnails: { type: 'array', items: { type: 'string' } }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { $ref: '#/components/schemas/Product' },
                  quantity: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = options.definition;
