module.exports = (sequelize, Sequelize) => {
  
    const ProductBarcode = sequelize.define('ProductBarcode', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying ProductBarcode.
            primaryKey:true
        },
        code: {
            type: Sequelize.STRING,
            allowNull:false,
            notEmpty: true
        },
    }, {
        tableName: 'product_barcodes',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        indexes: [{ unique: true, fields: ['code'] }],
    });  
    return ProductBarcode;
};