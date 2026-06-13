module.exports = (sequelize, Sequelize) => {
  
    const Tract = sequelize.define('Tract', {
        id:{
            // Sequelize module has INTEGER Data_Type.
            type:Sequelize.BIGINT,
            // To increment id automatically.
            autoIncrement:true,
            // id can not be null.
            allowNull:false,
            // For uniquely identifying Tract.
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
        status: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            allowNull:false,
        },
    }, {
        tableName: 'tracts',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        // indexes: [{ unique: true, fields: ['nano_id', 'name'] }],
    });  
    return Tract;
};