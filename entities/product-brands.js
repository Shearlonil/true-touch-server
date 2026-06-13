module.exports = (sequelize, Sequelize) => {
  
    const ProductBrand = sequelize.define('ProductBrand', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying ProductBrand.
            primaryKey:true
        },
        nano_id:{
            type:Sequelize.STRING,
            // nano_id can not be null.
            allowNull:false,
            notEmpty:true,
            unique: 'nano_id'
        },
        name: {
            type: Sequelize.STRING,
            allowNull:false,
            notEmpty: true,
            unique: 'name'
        },
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull:false,
        },
    }, {
        tableName: 'product_brands',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        // indexes: [{ unique: true, fields: ['nano_id'] }],
    });  
    return ProductBrand;
};