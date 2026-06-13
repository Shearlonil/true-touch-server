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
        qty_mgr_id:{
            type:Sequelize.BIGINT,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
        },
        // unit qty taken from qty mgr
        qty: {
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