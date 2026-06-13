module.exports = (sequelize, Sequelize) => {
  
    const ProductExpDate = sequelize.define('ProductExpDate', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying ProductExpDate.
            primaryKey:true
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull:true,
            // notEmpty: true
        },
    }, {
        tableName: 'product_exp_dates',
        timestamps: false,
    });  
    return ProductExpDate;
};