const yup = require("yup");

const productCreationSchema = yup.object().shape({
	product_name: yup.string().required("Product name required!"),
	barcode: yup.string().optional().nullable(),
	expDate: yup
		.date()
		.optional()
		.nullable(),
	restock_level: yup
		.number()
		.positive("Restock level must be positive")
		.required("Restock level is required"),
	sales_price: yup
		.number()
		.positive("Sales Price must be positive")
		.required("Sales Price is required"),
	brand: yup
		.string()
		.optional()
		.nullable()
		.transform((curr, orig) => (orig === '' ? null : curr)),
	category: yup
		.string()
		.optional()
		.nullable()
		.transform((curr, orig) => (orig === '' ? null : curr)),
	tract: yup.string().required("Product Department required!").typeError("Select a valid department"),
});

const storeItemRegSchema = yup.object().shape({
	section: yup.object().required("Select a section"),
	product_name: yup.string().required("Product name required!"),
	barcode: yup.string(),
	total_qty: yup
		.number()
		.positive("Quantity must be positive")
		.required("Quantity is required"),
	qty_type: yup.object().required("Select a packaging option"),
	qty_per_pkg: yup
		.number()
		.positive("Qty/Pkg must be positive")
		.required("Qty/Pkg is required"),
	unit_stock: yup
		.number()
		.positive("Unit Stock Price must be positive")
		.required("Unit Stock Price is required"),
	unit_sales: yup
		.number()
		.positive("Unit Sales Price must be positive")
		.required("Unit Sales Price is required"),
	pkg_stock_price: yup
		.number()
		.positive("Pkg Stock Price must be positive")
		.required("Pkg Stock Price is required"),
	pkg_sales_price: yup
		.number()
		.positive("Pkg Sales Price must be positive")
		.required("Pkg Sales Price is required"),
	markup: yup
		.number()
		.nullable()
		.min(0, 'Markup cannot be less than 0')
		.required("Markup is required"),
	vendor: yup.object().required("Vendor is required"),
	amount_paid: yup
		.number()
		.required("Amount Paid is required"),
});

const restockSchema = yup.object().shape({
	item: yup.object().required("Select a product"),
	total_qty: yup
		.number()
		.positive("Quantity must be positive")
		.required("Quantity is required"),
	qty_type: yup.object().required("Select a packaging option"),
	qty_per_pkg: yup
		.number()
		.positive("Qty/Pkg must be positive")
		.required("Qty/Pkg is required"),
	unit_stock: yup
		.number()
		.positive("Unit Stock Price must be positive")
		.required("Unit Stock Price is required"),
	unit_sales: yup
		.number()
		.positive("Unit Sales Price must be positive")
		.required("Unit Sales Price is required"),
	pkg_stock_price: yup
		.number()
		.positive("Pkg Stock Price must be positive")
		.required("Pkg Stock Price is required"),
	pkg_sales_price: yup
		.number()
		.positive("Pkg Sales Price must be positive")
		.required("Pkg Sales Price is required"),
	markup: yup
		.number()
		.nullable()
		.min(0, 'Markup cannot be less than 0')
		.required("Markup is required"),
	vendor: yup.object().required("Vendor is required"),
	amount_paid: yup
		.number()
		.required("Amount Paid is required"),
});

const productUpdateSchema = yup.object().shape({
	product_name: yup.string().required("Product name required!"),
	barcode: yup.string(),
	restock_level: yup
		.number()
		.positive("Restock Level must be positive")
		.required("Restock Level is required"),
	unit_sales: yup
		.number()
		.positive("Unit Sales Price must be positive")
		.required("Unit Sales Price is required"),
	pkg_sales_price: yup
		.number()
		.positive("Pkg Sales Price must be positive")
		.required("Pkg Sales Price is required"),
});

//	used in PurchasesUpdateForm
const purchasesUpdateSchema = yup.object().shape({
	qty_per_pkg: yup
		.number()
		.positive("Qty/Pkg must be positive")
		.required("Qty/Pkg is required"),
	total_qty: yup
		.number()
		.positive("Quantity must be positive")
		.required("Quantity is required"),
	qty_type: yup.object().required("Select a packaging option"),
	unit_stock: yup
		.number()
		.positive("Unit Stock Price must be positive")
		.required("Unit Stock Price is required"),
	amount_paid: yup
		.number()
		.required("Amount Paid is required"),
});

module.exports = { 
    productCreationSchema,
    storeItemRegSchema, 
    restockSchema, 
    productUpdateSchema, 
    purchasesUpdateSchema 
};
