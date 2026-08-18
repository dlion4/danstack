/* TypeScript declarations for CSS Modules and side-effect CSS imports. */
declare module "*.module.css" {
	const classes: { [key: string]: string };
	export default classes;
}
declare module "*.css";
