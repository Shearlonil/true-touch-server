/*  Model to represent Join table for Category and Products.  */
module.exports = (sequelize, Sequelize, product, category) => {
    /*  OneToMany relationship between Categories and Products. This association is optional. That is, it's possible for an item
        not to belong to any category. With this, a junction table is required but as Sequelize doesn't support this out of the
        box like Springboot/Hibernate, we use a Many-to-Many setup constrained by a database-level unique index on the 
        source model's column inside the junction table.
        This guarantees that while a target item can belong to multiple source items (Many-to-One), each source item can at 
        most pair with one target item. Because the relationship relies on an entry in the junction table, it remains fully 
        optional; if no row exists in the junction table for a source item, its relationship is simply null

        ref: Gemini when searched 'sequelize Many to One optional with joint table'
    */
    const JoinTblCategoryProducts = sequelize.define('JoinTblCategoryProducts', {
        product_id: {
            type: Sequelize.BIGINT,
            allowNull:false,
            references: {
                model: product, // database table name would also work
                key: 'id'
            }
        },
        category_id: {
            type: Sequelize.BIGINT,
            allowNull:false,
            references: {
                model: category, // database table name would also work
                key: 'id',
            },
            unique: true // <-- CRITICAL: Forces "Many-to-One" by allowing a category to appear only once
        }
    }, {
        freezeTableName: true,
        tableName: 'jt_category_products',
        timestamps: false,
    });  
    return JoinTblCategoryProducts;
};