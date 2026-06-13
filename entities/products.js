module.exports = (sequelize, Sequelize, DataTypes) => {
  
    const Product = sequelize.define('Product', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying Product.
            primaryKey:true
        },
        nano_id:{
            type:Sequelize.STRING,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
            unique: 'nano_id',
        },
        name: {
            type: Sequelize.STRING,
            allowNull:false,
            notEmpty: true,
            unique: 'name',
        },
        restock_level: {
            type: Sequelize.STRING,
            allowNull:false,
            notEmpty: true
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull:false,
        },
        sales_price: {
            type: DataTypes.DECIMAL(19,2),
            allowNull:false,
            notEmpty: true
        }
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        // indexes: [{ unique: true, fields: ['nano_id', 'name'] }],
    });  
    return Product;
};