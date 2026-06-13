module.exports = (sequelize, Sequelize, DataTypes) => {
  
    const ProductQtyMgr = sequelize.define('ProductQtyMgr', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying ProductQtyMgr.
            primaryKey:true
        },
        nano_id:{
            type:Sequelize.STRING,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
        },
        unit_stock_price: {
            type: DataTypes.DECIMAL(19,2),
            defaultValue: 0,
            allowNull:false,
            notEmpty: true
        },
        qty: {
            type: DataTypes.DECIMAL(19,2),
            defaultValue: 0,
            allowNull:false,
            notEmpty: true
        },
        qty_per_package: {
            type: DataTypes.DECIMAL(19,2),
            defaultValue: 0,
            allowNull:false,
            notEmpty: true
        },
    }, {
        tableName: 'product_qty_mgr',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        indexes: [{ unique: true, fields: ['nano_id'] }],
    });  
    return ProductQtyMgr;
};