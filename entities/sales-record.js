module.exports = (sequelize, Sequelize, DataTypes) => {
  
    const SalesRecord = sequelize.define('SalesRecord', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying SalesRecord.
            primaryKey:true
        },
        product_id:{
            type:Sequelize.BIGINT,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
        },
        invoice_id:{
            type:Sequelize.BIGINT,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
        },
        // qty sold
        qty: {
            type: DataTypes.DECIMAL(19,2),
            allowNull:false,
            notEmpty: true
        },
        // quantity type{unit or metric package}
        qty_type: {
            type: Sequelize.STRING,
            allowNull:false,
            notEmpty: true
        },
        // sold out price
        price: {
            type: DataTypes.DECIMAL(19,2),
            allowNull:false,
            notEmpty: true
        },
        discount: {
            type: DataTypes.DECIMAL(19,2),
            allowNull:false,
            notEmpty: true
        },
    }, {
        tableName: 'sales_record',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
    });  
    return SalesRecord;
};