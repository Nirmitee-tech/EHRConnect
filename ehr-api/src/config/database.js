require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'medplum',
        password: process.env.DB_PASSWORD || 'medplum123',
        database: process.env.DB_NAME || 'medplum',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        seederStorage: 'sequelize',
    },
    test: {
        username: process.env.DB_USER || 'medplum',
        password: process.env.DB_PASSWORD || 'medplum123',
        database: process.env.DB_NAME || 'medplum_test',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        dialect: 'postgres',
        seederStorage: 'sequelize',
    }
};
