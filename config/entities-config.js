const { Op, Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./sequelize-db-connect');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Op;

db.users = require('../entities/users')(sequelize, Sequelize);
db.refreshTokens = require('../entities/refresh-tokens')(sequelize, Sequelize);
db.staff = require('../entities/staff')(sequelize, Sequelize);
db.products = require('../entities/products')(sequelize, Sequelize, DataTypes);
db.brands = require('../entities/product-brands')(sequelize, Sequelize);
db.tracts = require('../entities/tracts')(sequelize, Sequelize);
db.categories = require('../entities/product-category')(sequelize, Sequelize);
db.expDate = require('../entities/product-exp-date')(sequelize, Sequelize);
db.staffAuths = require('../entities/staff-authority')(sequelize, Sequelize);
db.mailOTP = require('../entities/mail-otp')(sequelize, Sequelize);
db.termsAndAgreement = require('../entities/terms-and-agreement')(sequelize, Sequelize);
db.notifications = require('../entities/notification')(sequelize, Sequelize);
db.emailsToUpdate = require('../entities/emails-to-update')(sequelize, Sequelize);
db.tblJoinBrandProducts = require('../entities/tblJoinBrandProducts')(sequelize, Sequelize, db.products, db.brands);
db.tblJoinCategoryProducts = require('../entities/tblJoinCategoryProducts')(sequelize, Sequelize, db.products, db.categories);
db.tblJoinStaffAuths = require('../entities/tblJoinStaffAuths')(sequelize, Sequelize, db.staff, db.staffAuths);

/*  OneToMany relationship between Categories and Products. This association is optional. That is, it's possible for an item
    not to belong to any category. With this, a junction table is required but as Sequelize doesn't support this out of the
    box like Springboot/Hibernate, we use a Many-to-Many setup constrained by a database-level unique index on the 
    source model's column inside the junction table.
    This guarantees that while a target item can belong to multiple source items (Many-to-One), each source item can at 
    most pair with one target item. Because the relationship relies on an entry in the junction table, it remains fully 
    optional; if no row exists in the junction table for a source item, its relationship is simply null
*/
db.products.belongsToMany(db.categories, { 
    onDelete: 'CASCADE',
    through: db.tblJoinCategoryProducts,
    foreignKey: 'product_id',
    otherKey: 'category_id'
});
db.categories.belongsToMany(db.products, { 
    through: db.tblJoinCategoryProducts,
    foreignKey: 'category_id',
    otherKey: 'product_id'
});

/*  OneToMany relationship between Brands and Products. This association is optional. That is, it's possible for an item
    not to belong to any brand. With this, a junction table is required but as Sequelize doesn't support this out of the
    box like Springboot/Hibernate, we use a Many-to-Many setup constrained by a database-level unique index on the 
    source model's column inside the junction table.
    This guarantees that while a target item can belong to multiple source items (Many-to-One), each source item can at 
    most pair with one target item. Because the relationship relies on an entry in the junction table, it remains fully 
    optional; if no row exists in the junction table for a source item, its relationship is simply null
*/
db.products.belongsToMany(db.brands, { 
    onDelete: 'CASCADE',
    through: db.tblJoinBrandProducts,
    foreignKey: 'product_id',
    otherKey: 'brand_id'
});
db.brands.belongsToMany(db.products, { 
    through: db.tblJoinBrandProducts,
    foreignKey: 'brand_id',
    otherKey: 'product_id'
});

/*  Assocation between product and expiration date. The expiration date field is an optional field. Hence, it's designation
    into it's own table
*/
db.products.hasOne(db.expDate, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'product_id',
        allowNull: false,
    }
});
db.expDate.belongsTo(db.products, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'product_id',
        allowNull: false,
    }
});

// OneToMany relationship between User and Sections (Craetors of sections)
db.staff.hasMany(db.tracts, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'creator',
        allowNull: false,
    }
});
db.tracts.belongsTo(db.staff, {
    foreignKey: {
        name: 'creator',
        allowNull: false,
    }
});

// OneToMany relationship between User and Categories (Craetors of Categories)
db.staff.hasMany(db.categories, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'creator',
        allowNull: false,
    }
});
db.categories.belongsTo(db.staff, {
    foreignKey: {
        name: 'creator',
        allowNull: false,
    }
});

// OneToMany relationship between User and Brands (Craetors of Brands)
db.staff.hasMany(db.brands, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'creator',
        allowNull: false,
    }
});
db.brands.belongsTo(db.staff, {
    foreignKey: {
        name: 'creator',
        allowNull: false,
    }
});

// OneToMany relationship between Section and Products
db.tracts.hasMany(db.products, {
    foreignKey: {
        // also set the foreign key name here to avoid sequelize adding column TractId
        name: 'tract_id',
        allowNull: false,
    }
});
db.products.belongsTo(db.tracts, {
    foreignKey: {
        name: 'tract_id',
        allowNull: false,
    }
});

// ManyToMany relationship between staff and authorities
db.staff.belongsToMany(db.staffAuths, { 
    onDelete: 'CASCADE',
    through: db.tblJoinStaffAuths,
    foreignKey: 'staff_id',
    otherKey: 'auth_id'
});
db.staffAuths.belongsToMany(db.staff, { 
    through: db.tblJoinStaffAuths,
    foreignKey: 'auth_id',
    otherKey: 'staff_id'
});

db.connect = async () => {
    try {
        await sequelize.authenticate();
        /*  This checks what is the current state of the table in the database (which columns it has, what are their data types, etc), 
            and then performs the necessary changes in the table to make it match the model.
        */
        // await sequelize.sync( { alter: true } );
        /*  Too many keys specified in sequelize sync   
            ref:    https://medium.com/@xmalikfajar/too-many-keys-specified-in-sequelize-sync-db60cf74b2ab
                    https://stackoverflow.com/questions/5021586
                    https://stackoverflow.com/questions/48637184
            
            SELECT CONCAT('ALTER TABLE {your_table / your_model} ',
            GROUP_CONCAT(CONCAT('DROP INDEX ', index_name) SEPARATOR ', '), ';')
            FROM information_schema.statistics
            WHERE table_name = '{your_table / your_model}'
            AND index_name LIKE '{your_indexes}_%';
            */
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = db;