module.exports = (sequelize, Sequelize, DataTypes) => {
  
    const ProductSalesPrices = sequelize.define('ProductSalesPrices', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying ProductSalesPrices.
            primaryKey:true
        },
        unit_sales: {
            type: DataTypes.DECIMAL(19,2),
            defaultValue: 0,
            allowNull:false,
            notEmpty: true
        },
        pkg_sales: {
            type: DataTypes.DECIMAL(19,2),
            defaultValue: 0,
            allowNull:false,
            notEmpty: true
        },
    }, {
        tableName: 'product_sales_prices',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
    });  
    return ProductSalesPrices;
};