module.exports = {
    // ref: https://www.prospects.ac.uk/jobs-and-work-experience/job-sectors
    bora: {
        fname: "Genius",
        lname: "Computers",
        phone: "08034262759",
        email: "geecomptech@gmail.com",
        sex: "M",
        acc_creator: 1,
    },
    // 100 series => users/staff
    // 200 series => course, Brand, Category et'al
    // 300 series => clients
    // 400 series => miscellaneous
    authorities: {
        activateDeactiveteAccount: {
            name: "Activate/Deactivate Accounts",
            code: 100,
            desc: "Ability to activate/deativate company staff accounts",
        },
        addStaffAccount: {
            name: "Add Staff Accounts",
            code: 101,
            desc: "Ability to add company staff accounts",
        },
        updateStaffRoles: {
            name: "Update Staff Roles",
            code: 102,
            desc: "Ability to add/remove staff roles/authorities",
        },
        viewStaff: {
            name: "View Registered Staff",
            code: 103,
            desc: "View all registered staff accounts",
        },
        staffSearch: {
            name: "Staff Search",
            code: 104,
            desc: "Search Staff by ID or Email",
        },
        viewStaffProfile: {
            name: "View Staff Profile/Auths",
            code: 105,
            desc: "View registered staff profile/auths",
        },
        createProducts: {
            name: "Add Products",
            code: 200,
            desc: "Add/Create Products",
        },
        deleteActivateProducts: {
            name: "Delete/Activate Products",
            code: 201,
            desc: "Delete/Activate Products",
        },
        updateProducts: {
            name: "Update/Edit Products",
            code: 202,
            desc: "Update/Edit Products",
        },
        createBrands: {
            name: "Add Brands",
            code: 203,
            desc: "Add/Create Brands",
        },
        deleteActivateBrands: {
            name: "Delete/Activate Brands",
            code: 204,
            desc: "Delete/Activate Brands",
        },
        updateBrands: {
            name: "Update/Edit Brands",
            code: 205,
            desc: "Update/Edit Brands",
        },
        createCategory: {
            name: "Add Category",
            code: 206,
            desc: "Add/Create Category",
        },
        deleteActivateCategory: {
            name: "Delete/Activate Category",
            code: 207,
            desc: "Delete/Activate Category",
        },
        updateCategory: {
            name: "Update/Edit Category",
            code: 208,
            desc: "Update/Edit Category",
        },
        createTract: {
            name: "Add Tract",
            code: 209,
            desc: "Add/Create Tract",
        },
        deleteActivateTract: {
            name: "Delete/Activate Tract",
            code: 210,
            desc: "Delete/Activate Tract",
        },
        updateTract: {
            name: "Update/Edit Tract",
            code: 211,
            desc: "Update/Edit Tract",
        },
        updateSalesPrices: {
            name: "Update/Edit SalesPrices",
            code: 212,
            desc: "Update/Edit SalesPrices",
        },
        viewClients: {
            name: "View Clients",
            code: 300,
            desc: "View client accounts. View unverified email addresses",
        },
        activateDeactivateClients: {
            name: "Activate/Deactivate Clients",
            code: 301,
            desc: "Activating/Deativating client accounts",
        },
        clientSearch: {
            name: "Client Search",
            code: 302,
            desc: "Search Clients (rs) by id or email",
        },
        sendNotifications: {
            name: "Send Notifications",
            code: 400,
            desc: "Send notifications when required",
        },
        updateTermsAndAgreement: {
            name: "Update Terms and Agreement",
            code: 406,
            desc: "Updating Terms and Agreement",
        },
    },
};
