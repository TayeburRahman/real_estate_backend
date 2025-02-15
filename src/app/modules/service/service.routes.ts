import express from 'express';
import { ServiceController } from './service.controller';
import uploadC from '../../middlewares/cloudinaryUpload';

const router = express.Router();

router.post("/create-category", ServiceController.createServiceCategory);
router.patch("/update-category/:id", ServiceController.updateServiceCategory);
router.delete("/delete-category/:id", ServiceController.deleteServiceCategory);
router.get("/get-all-categories", ServiceController.getAllServiceCategories);
// ==============================
router.post(
    "/create-service",
    uploadC.array('service_image'),
    ServiceController.createService
);
router.patch(
    "/update-service/:id",
    uploadC.array("service_image"),
    ServiceController.updateService
);
router.delete("/delete/:id", ServiceController.deleteService);
router.get("/services", ServiceController.getAllServices);
// =======================
router.post(
    "/create-package",
    uploadC.array('package_image'),
    ServiceController.createPackages
);
router.patch(
    "/update-package/:id",
    uploadC.array("package_image"),
    ServiceController.updatePackages
);
router.delete("/package-delete/:id", ServiceController.deletePackages);
router.get("/packages", ServiceController.getAllPackages);
// =======================
router.post("/create-pricing-group", ServiceController.createPricingGroup);
router.patch("/update-pricing-group/:id", ServiceController.updatePricingGroup);
router.delete("/delete-pricing-group/:id", ServiceController.deletePriceGroups);
router.get("/price-group", ServiceController.getAllGroupPrice);
router.get("/price-group-details/:id", ServiceController.getAllGroupPriceDetails);

router.get("/get-all-client", ServiceController.getAllClients);
router.get("/get-all-service", ServiceController.getAllServicesWithoutPagination);
// ==================================
router.get("/get-client-service/:clientId", ServiceController.getClientServices);






export const ServiceRoutes = router;
