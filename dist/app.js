"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: ()=>_default
});
const _cookieParser = _interopRequireDefault(require("cookie-parser"));
const _express = _interopRequireDefault(require("express"));
const _swaggerJsdoc = _interopRequireDefault(require("swagger-jsdoc"));
const _swaggerUiExpress = _interopRequireDefault(require("swagger-ui-express"));
const _config = require("./config");
const _errorMiddleware = _interopRequireDefault(require("./middlewares/error.middleware"));
const _logger = require("./utils/logger");
const _typescriptSwagger = require("typescript-swagger");
const _databases = require("@databases");
const _mongoose = require("mongoose");
const _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const packageJson = require('../package.json');
const tsConfig = require('../tsconfig.json');
const swaggerConfig = {
    yaml: true,
    name: 'API - Documentation',
    description: packageJson.description,
    basePath: '/',
    host: 'localhost:3000',
    version: packageJson.version,
    outputDirectory: 'public',
    entryFile: _path.default.join('src', 'controllers', '**', '*.ts'),
    decoratorConfig: {
        useBuildIn: true,
        useLibrary: [
            'typescript-rest',
            '@decorators/express'
        ]
    },
    ignore: [
        '**/node_modules/**'
    ],
    consumes: [
        'application/json'
    ],
    produces: [
        'application/json'
    ]
};
let App = class App {
    listen() {
        this.app.listen(this.port, ()=>{
            _logger.logger.info(`=================================`);
            _logger.logger.info(`======= ENV: ${this.env} =======`);
            _logger.logger.info(`🚀 App listening on the port ${this.port}`);
            _logger.logger.info(`=================================`);
        });
    }
    getServer() {
        return this.app;
    }
    async connectToDatabase() {
        if (this.env !== 'production') {
            (0, _mongoose.set)('debug', true);
        }
        try {
            await (0, _mongoose.connect)(_databases.dbConnection.url, _databases.dbConnection.options);
            _logger.logger.info('MongoDB Connected.');
        } catch (error) {
            _logger.logger.info('MongoDB ConnectError:', error);
        }
    }
    initializeMiddlewares() {
        this.app.use(_express.default.json());
        this.app.use(_express.default.urlencoded({
            extended: true
        }));
        this.app.use((0, _cookieParser.default)());
    }
    initializeRoutes(routes) {
        routes.forEach((route)=>{
            this.app.use('/', route.router);
        });
    }
    async initializeSwagger() {
        await (0, _typescriptSwagger.generateDocumentation)(swaggerConfig, tsConfig);
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs'
                }
            },
            apis: [
                'swagger.yaml'
            ]
        };
        const specs = (0, _swaggerJsdoc.default)(options);
        this.app.use('/api-docs', _swaggerUiExpress.default.serve, _swaggerUiExpress.default.setup(specs));
    }
    initializeErrorHandling() {
        this.app.use(_errorMiddleware.default);
    }
    constructor(routes){
        this.app = (0, _express.default)();
        this.env = _config.NODE_ENV || 'development';
        this.port = _config.PORT || 3000;
        this.initializeMiddlewares();
        this.connectToDatabase();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
};
const _default = App;

//# sourceMappingURL=app.js.map