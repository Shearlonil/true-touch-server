const db = require('../config/entities-config');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const { bora, authorities } = require('../utils/default-entries');

const Staff = db.staff;
const Authority = db.staffAuths;
const terms = db.termsAndAgreement;
const Tract = db.tracts;

const setUp = async () => {
    try {
        await db.sequelize.transaction( async (t) => {
            const admin = await createDefaultAdmin(t);
            await createAuths(t, admin);
            await createDefaultTracts(t, admin);
            // create default Terms and Conditions
            const arr = [
                {
                    attributes: { bold: true },
                    insert: "Advertising Terms of use" 
                },
                {
                    insert: "\n",
                }
            ];
            await terms.create({value: arr}, { transaction: t });
        });
    } catch (error) {
        // If the execution reaches this line, an error occurred.
        // The transaction has already been rolled back automatically by Sequelize!
        throw new Error(error.message); // rethrow the error for front-end 
    }
}

const createDefaultAdmin = async (t) => {
    const { fname, lname, phone, email, sex, acc_creator } = bora;
    // encrypt password
    const hashedPwd = await bcrypt.hash('123456', 12);
    return await Staff.create(
        { nano_id: nanoid(), fname, lname, phone, pw: hashedPwd, email, status: true, sex, acc_creator },
        { transaction: t }
    );
};

const createAuths = async (t, admin) => {
    for (const key in authorities) {
        const { name, code, desc } = authorities[key];
        const auth = await Authority.create({ name, code, desc }, { transaction: t });
        await admin.addAuthority(auth, { transaction: t });
    }
}

const createDefaultTracts = async (t, admin) => {
    await Tract.create({ nano_id: nanoid(), name: "Supermarket", creator: admin.id }, { transaction: t });
    await Tract.create({ nano_id: nanoid(), name: "Pharmacy", creator: admin.id }, { transaction: t });
}

module.exports = setUp;