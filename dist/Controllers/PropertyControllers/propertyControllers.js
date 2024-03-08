"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.removeFromWishlist = exports.AddToWishlist = exports.getWishlistData = exports.hostCancelReservation = exports.getAllListingsReservations = exports.cancelReservationHandler = exports.getAllUserBookings = exports.validatePaymentAndCompleteReservation = exports.createReservationOrderHandler = exports.checkAvailability = exports.listPropertyHandler = void 0;
const zod_1 = require("zod");
const hotelAddressModel_1 = require("../../Models/hotelAddressModel");
const hotelLisitingModal_1 = require("../../Models/hotelLisitingModal");
const reservationModal_1 = require("../../Models/reservationModal");
const mongoose_1 = __importDefault(require("mongoose"));
const razorpay_1 = __importDefault(require("razorpay"));
const razorPayDetailsModal_1 = require("../../Models/razorPayDetailsModal");
const userModel_1 = require("../../Models/userModel");
const reviewModel_1 = require("../../Models/reviewModel");
const HotelListingSchema = zod_1.z.object({
    addressLine: zod_1.z.string().min(3, " Min length For address is 3").max(20),
    city: zod_1.z.string().min(3, " Min length For city is 3").max(15),
    district: zod_1.z.string().min(3, " Min length For district is 3").max(15),
    state: zod_1.z.string().min(3, " Min length is 3").max(15),
    totalRooms: zod_1.z.number().min(1),
    maxGuests: zod_1.z.number().min(1),
    bedsPerRoom: zod_1.z.number().min(1),
    bathroomPerRoom: zod_1.z.number().min(1),
    amenities: zod_1.z.array(zod_1.z.string()),
    hotelLicenseUrl: zod_1.z.string().min(1),
    aboutHotel: zod_1.z.string().min(20),
    listingTitle: zod_1.z.string().min(10).max(60),
    roomType: zod_1.z.string().min(3),
    rentPerNight: zod_1.z.number().min(1000),
    mainImage: zod_1.z.string().refine((value) => {
        return value;
    }, "Main Img Is Compulsory"),
    otherImages: zod_1.z.array(zod_1.z.string()).refine((values) => {
        let pics = values.filter((val) => val);
        return pics.length >= 4;
    }, "Needed Four Other Images"),
    pinCode: zod_1.z.string().refine((value) => {
        const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;
        return INDIAN_PINCODE_REGEX.test(value);
    }, "Invalid Indian Pincode"),
});
const listPropertyHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const propertyListingData = req.body;
        console.log("\t \t \t \t ", propertyListingData, "...listing ");
        const validationResult = HotelListingSchema.safeParse(propertyListingData);
        if (!validationResult.success) {
            const validationError = validationResult.error;
            res.status(400).json({ message: validationError.errors[0].message });
        }
        if (validationResult.success) {
            const { addressLine, district, city, state, pinCode, totalRooms, maxGuests, bedsPerRoom, bathroomPerRoom, amenities, mainImage, otherImages, listingTitle, roomType, hotelLicenseUrl, aboutHotel, rentPerNight, } = validationResult.data;
            let userID = (_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.id;
            if (!userID)
                throw new Error("Failed to identify user from req.userInfo.Id");
            let newListing = new hotelLisitingModal_1.HotelListing({
                userID,
                totalRooms,
                maxGuestsPerRoom: maxGuests,
                bedsPerRoom,
                bathroomPerRoom,
                amenities,
                mainImage,
                otherImages,
                listingTitle,
                roomType,
                hotelLicenseUrl,
                aboutHotel,
                rentPerNight,
            });
            yield newListing.save();
            let hotelAddress = new hotelAddressModel_1.HotelAddress({
                listingID: newListing._id,
                userID,
                addressLine,
                city,
                district,
                state,
                pinCode,
            });
            yield hotelAddress.save();
            newListing.address = hotelAddress._id;
            yield newListing.save();
            return res.status(201).json({ message: "new Listing created" });
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.listPropertyHandler = listPropertyHandler;
const checkAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_b = req.userInfo) === null || _b === void 0 ? void 0 : _b.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        let { listingID, checkInDate, checkOutDate, rooms } = req.body;
        listingID = new mongoose_1.default.Types.ObjectId(listingID);
        if (!listingID || !checkInDate || !checkOutDate || !rooms) {
            return res.status(400).json({
                message: "Failed : all data fields are necessary . Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!listingData.approvedForReservation ||
            !listingData.isActiveForReservation) {
            return res
                .status(400)
                .json({ message: "Sorry the property is not available for listing " });
        }
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        let dateWiseReservation = listingData.dateWiseReservationData || {};
        for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
            let dateString = new Date(date).toISOString().split("T")[0];
            if (!dateWiseReservation.hasOwnProperty(dateString)) {
                dateWiseReservation[dateString] = rooms;
            }
            else {
                let existingValue = dateWiseReservation[dateString];
                if (existingValue + rooms > listingData.totalRooms) {
                    return res.status(400).json({
                        message: "Unfortunately adequate rooms  not  available in given days",
                    });
                }
                dateWiseReservation[dateString] = existingValue + rooms;
            }
        }
        return res
            .status(200)
            .json({ message: " Success: Rooms are available for the given days" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.checkAvailability = checkAvailability;
const createReservationOrderHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        console.log("instance");
        let KEY_ID = yield process.env.RAZORPAY_KEY_ID;
        let KEY_SECRET = yield process.env.RAZORPAY_KEY_SECRET;
        console.log("instance", KEY_ID, KEY_SECRET);
        if (!KEY_ID || !KEY_SECRET) {
            return res.sendStatus(500);
        }
        const instance = yield new razorpay_1.default({
            key_id: KEY_ID,
            key_secret: KEY_SECRET,
        });
        const userID = new mongoose_1.default.Types.ObjectId((_c = req.userInfo) === null || _c === void 0 ? void 0 : _c.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        let { listingID, checkInDate, checkOutDate, rooms } = req.body;
        listingID = new mongoose_1.default.Types.ObjectId(listingID);
        if (!listingID || !checkInDate || !checkOutDate || !rooms) {
            return res.status(400).json({
                message: "Failed : all data fields are necessary . Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!listingData.approvedForReservation ||
            !listingData.isActiveForReservation) {
            return res
                .status(400)
                .json({ message: "Sorry the property is not available for listing " });
        }
        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        let numberOfDays = 0;
        let dateWiseReservation = listingData.dateWiseReservationData || {};
        for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
            let dateString = new Date(date).toISOString().split("T")[0];
            if (!dateWiseReservation.hasOwnProperty(dateString)) {
                dateWiseReservation[dateString] = rooms;
            }
            else {
                let existingValue = dateWiseReservation[dateString];
                if (existingValue + rooms > listingData.totalRooms) {
                    return res.status(400).json({
                        message: "Unfortunately adequate rooms  not  available in given days",
                    });
                }
                dateWiseReservation[dateString] = existingValue + rooms;
            }
            numberOfDays++;
        }
        console.log("instance after day");
        listingData.dateWiseReservationData = dateWiseReservation;
        const response = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            dateWiseReservationData: dateWiseReservation,
        });
        console.log(response);
        const fee = ((listingData === null || listingData === void 0 ? void 0 : listingData.rentPerNight) * numberOfDays * rooms * 10) / 100;
        const reservationData = new reservationModal_1.HotelReservation({
            userID,
            listingID,
            checkInDate,
            checkOutDate,
            rooms,
            reservationFee: fee,
            paymentStatus: "pending",
            reservationStatus: "paymentPending",
        });
        yield reservationData.save();
        let reservationID = reservationData.id;
        yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            $push: { reservations: reservationID },
        });
        const amount = reservationData.reservationFee * 100;
        const receipt = reservationData._id.toString();
        const currency = "INR";
        const options = {
            amount: amount,
            currency: currency,
            receipt: receipt,
        };
        const order = yield instance.orders.create(options);
        if (!order)
            return res.status(500);
        reservationData.razorpayOrderID = order.id;
        yield reservationData.save();
        return res.status(200).json({
            message: "successfully made reservation",
            order,
            reservationID: reservationData._id,
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.createReservationOrderHandler = createReservationOrderHandler;
const validatePaymentAndCompleteReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        console.log("instance");
        const userID = new mongoose_1.default.Types.ObjectId((_d = req.userInfo) === null || _d === void 0 ? void 0 : _d.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        let { reservationID, listingID, amount, orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature, } = req.body;
        reservationID = new mongoose_1.default.Types.ObjectId(reservationID);
        listingID = new mongoose_1.default.Types.ObjectId(listingID);
        if (!listingID ||
            !reservationID ||
            !amount ||
            !orderCreationId ||
            !razorpayPaymentId ||
            !razorpayOrderId ||
            !razorpaySignature) {
            return res.status(400).json({
                message: "Failed : all data fields are necessary . Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!listingData.approvedForReservation ||
            !listingData.isActiveForReservation) {
            return res
                .status(400)
                .json({ message: "Sorry the property is not available for listing " });
        }
        let reservationData = yield reservationModal_1.HotelReservation.findById(reservationID);
        if (!reservationData)
            return res
                .status(400)
                .json({ message: "failed to find the reservation data " });
        console.log(new mongoose_1.default.Types.ObjectId(reservationData.listingID).equals(listingID), "first");
        console.log(reservationData.razorpayOrderID == orderCreationId, "second");
        console.log(reservationData.reservationFee * 100 == Number(amount), "third");
        if (!new mongoose_1.default.Types.ObjectId(reservationData.listingID).equals(listingID) ||
            reservationData.razorpayOrderID !== orderCreationId ||
            reservationData.reservationFee * 100 !== Number(amount)) {
            return res
                .status(400)
                .json({ message: "failed to validate payment data inconsistency" });
        }
        const paymentDetails = new razorPayDetailsModal_1.RazorPayDetails({
            userID,
            listingID,
            reservationID,
            amountPaid: amount,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        });
        yield paymentDetails.save();
        reservationData.paymentStatus = "paid";
        reservationData.reservationStatus = "success";
        yield reservationData.save();
        return res.status(200).json({ message: "payment verified successfully" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.validatePaymentAndCompleteReservation = validatePaymentAndCompleteReservation;
const getAllUserBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        console.log("instance");
        const userID = new mongoose_1.default.Types.ObjectId((_e = req.userInfo) === null || _e === void 0 ? void 0 : _e.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        const data = yield reservationModal_1.HotelReservation.aggregate([
            {
                $match: {
                    userID: userID,
                    reservationStatus: "success",
                },
            },
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    checkInDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$checkInDate",
                        },
                    },
                    checkOutDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$checkOutDate",
                        },
                    },
                    rooms: 1,
                    maxGuests: "$listingData.maxGuestsPerRoom",
                    image: "$listingData.mainImage",
                    address: "$listingData.address",
                },
            },
            {
                $lookup: {
                    from: "hoteladdresses",
                    localField: "address",
                    foreignField: "_id",
                    as: "addressData",
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
        ]);
        console.log(data);
        return res.status(200).json({ bookings: data });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllUserBookings = getAllUserBookings;
const cancelReservationHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        console.log("instance");
        const userID = new mongoose_1.default.Types.ObjectId((_f = req.userInfo) === null || _f === void 0 ? void 0 : _f.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        const reservationID = new mongoose_1.default.Types.ObjectId(req.params.reservationID);
        if (!reservationID) {
            return res
                .status(400)
                .json({ message: "failed to identify reservation " });
        }
        const reservation = yield reservationModal_1.HotelReservation.findOne({
            _id: reservationID,
            userID,
        });
        if (!reservation) {
            return res.status(400).json({
                message: "failed to identify the specific reservation of user",
            });
        }
        const listingID = reservation.listingID;
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!reservation.checkInDate || !reservation.checkOutDate) {
            return res
                .status(400)
                .json({ message: "failed to get reservationData " });
        }
        const startDate = new Date(reservation.checkInDate);
        const endDate = new Date(reservation.checkOutDate);
        let dateWiseReservation = listingData.dateWiseReservationData || {};
        let roomsBooked = reservation.rooms;
        for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
            let dateString = new Date(date).toISOString().split("T")[0];
            if (dateWiseReservation.hasOwnProperty(dateString)) {
                let existingValue = dateWiseReservation[dateString];
                if (existingValue >= roomsBooked) {
                    dateWiseReservation[dateString] = existingValue - roomsBooked;
                }
            }
        }
        const updatedListingData = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            dateWiseReservationData: dateWiseReservation,
        });
        reservation.reservationStatus = "cancelled";
        yield reservation.save();
        yield userModel_1.User.findByIdAndUpdate(userID, {
            $inc: { wallet: reservation.reservationFee },
        });
        reservation.paymentStatus = "refunded";
        yield reservation.save();
        return res
            .status(200)
            .json({ message: "reservation cancelled successFully" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.cancelReservationHandler = cancelReservationHandler;
const getAllListingsReservations = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_g = req.userInfo) === null || _g === void 0 ? void 0 : _g.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify host " });
        }
        let queryParams = req.query;
        let search = "";
        if (queryParams.search) {
            search = queryParams.search.trim();
        }
        let page = 1;
        if (Number(queryParams.page)) {
            page = Number(queryParams.page);
        }
        let limit = 5;
        let filterQuery = {
            hotelName: {},
            hostID: userID,
        };
        filterQuery.hotelName = { $regex: search, $options: "i" };
        const reservations = yield reservationModal_1.HotelReservation.aggregate([
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "hoteladdresses",
                    localField: "listingData.address",
                    foreignField: "_id",
                    as: "addressData",
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userID",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            {
                $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    checkInDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$checkInDate",
                        },
                    },
                    checkOutDate: {
                        $dateToString: {
                            format: "%d-%m-%Y",
                            date: "$checkOutDate",
                        },
                    },
                    reservationFee: 1,
                    rooms: 1,
                    paymentStatus: 1,
                    reservationStatus: 1,
                    hostID: "$listingData.userID",
                    image: "$listingData.mainImage",
                    hotelName: "$addressData.addressLine",
                    customerName: "$userData.username",
                },
            },
            {
                $match: filterQuery,
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
        const totalReservations = yield reservationModal_1.HotelReservation.aggregate([
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "hoteladdresses",
                    localField: "listingData.address",
                    foreignField: "_id",
                    as: "addressData",
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    hostID: "$listingData.userID",
                    hotelName: "$addressData.addressLine",
                },
            },
            {
                $match: filterQuery,
            },
        ]);
        console.log(totalReservations);
        const totalPages = Math.ceil(totalReservations.length / limit);
        return res.status(200).json({ reservations, totalPages });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getAllListingsReservations = getAllListingsReservations;
const hostCancelReservation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        console.log("instance");
        const hostID = new mongoose_1.default.Types.ObjectId((_h = req.userInfo) === null || _h === void 0 ? void 0 : _h.id);
        if (!hostID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        const reservationID = new mongoose_1.default.Types.ObjectId(req.params.reservationID);
        if (!reservationID) {
            return res
                .status(400)
                .json({ message: "failed to identify reservation " });
        }
        let reservationData = yield reservationModal_1.HotelReservation.aggregate([
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "listingID",
                    foreignField: "_id",
                    as: "listingData",
                },
            },
            {
                $unwind: { path: "$listingData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    userID: 1,
                    listingID: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    rooms: 1,
                    reservationFee: 1,
                    hostID: "$listingData.userID",
                    hotelName: "$addressData.addressLine",
                },
            },
            {
                $match: { hostID, _id: reservationID },
            },
        ]);
        if (!reservationData) {
            return res.status(400).json({
                message: "failed to identify the specific reservation ",
            });
        }
        let reservation = reservationData[0];
        // console.log(reservationData);
        const listingID = reservation.listingID;
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!reservation.checkInDate || !reservation.checkOutDate) {
            return res
                .status(400)
                .json({ message: "failed to get reservationData " });
        }
        const startDate = new Date(reservation.checkInDate);
        const endDate = new Date(reservation.checkOutDate);
        let dateWiseReservation = listingData.dateWiseReservationData || {};
        let roomsBooked = reservation.rooms;
        for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
            let dateString = new Date(date).toISOString().split("T")[0];
            if (dateWiseReservation.hasOwnProperty(dateString)) {
                let existingValue = dateWiseReservation[dateString];
                if (existingValue >= roomsBooked) {
                    dateWiseReservation[dateString] = existingValue - roomsBooked;
                }
            }
        }
        console.log(dateWiseReservation, "after \t \t");
        const updatedListingData = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            dateWiseReservationData: dateWiseReservation,
        }, { new: true });
        console.log(updatedListingData, "updated listing \t \t");
        const updatedUserData = yield userModel_1.User.findByIdAndUpdate(reservation.userID, {
            $inc: { wallet: reservation.reservationFee },
        }, { new: true });
        console.log(updatedUserData, "updated listing \t \t");
        let updatedReservation = yield reservationModal_1.HotelReservation.findByIdAndUpdate(reservationID, { reservationStatus: "cancelled", paymentStatus: "refunded" }, { new: true });
        console.log(updatedReservation, "updated listing \t \t");
        return res
            .status(200)
            .json({ message: "reservation cancelled successFully" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.hostCancelReservation = hostCancelReservation;
const getWishlistData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_j = req.userInfo) === null || _j === void 0 ? void 0 : _j.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        const wishLists = yield userModel_1.User.aggregate([
            {
                $match: {
                    _id: userID,
                },
            },
            {
                $project: {
                    wishlist: 1,
                },
            },
            {
                $lookup: {
                    from: "hotellistings",
                    localField: "wishlist",
                    foreignField: "_id",
                    as: "wishlistData",
                },
            },
            {
                $project: {
                    wishlistData: 1,
                    hasValue: {
                        $cond: {
                            if: { $eq: [{ $size: "$wishlistData" }, 0] },
                            then: false,
                            else: true,
                        },
                    },
                },
            },
            {
                $match: { hasValue: true },
            },
            {
                $unwind: { path: "$wishlistData", preserveNullAndEmptyArrays: true },
            },
            {
                $replaceRoot: {
                    newRoot: "$wishlistData",
                },
            },
            {
                $lookup: {
                    from: "hoteladdresses",
                    localField: "address",
                    foreignField: "_id",
                    as: "addressData",
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    mainImage: 1,
                    hotelName: "$addressData.addressLine",
                },
            },
        ]);
        console.log(wishLists);
        return res.status(200).json({ wishLists });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.getWishlistData = getWishlistData;
// add to wishlist
const AddToWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_k = req.userInfo) === null || _k === void 0 ? void 0 : _k.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        let listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        const userData = yield userModel_1.User.findById(userID);
        if (!listingID) {
            return res.status(400).json({
                message: "Failed to identify  the listingID. Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!listingData.approvedForReservation ||
            !listingData.isActiveForReservation) {
            return res
                .status(400)
                .json({ message: "Sorry the property is not available now " });
        }
        if (userData === null || userData === void 0 ? void 0 : userData.wishlist.includes(listingID))
            return res
                .status(400)
                .json({ message: "Hotel already exist in wishlist" });
        const updatedUser = yield userModel_1.User.findByIdAndUpdate(userID, {
            $push: {
                wishlist: listingID,
            },
        });
        return res.status(200).json({
            message: "successfully added to wishlist",
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.AddToWishlist = AddToWishlist;
// remove from wishlist
const removeFromWishlist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_l = req.userInfo) === null || _l === void 0 ? void 0 : _l.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        let listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        const userData = yield userModel_1.User.findById(userID);
        if (!listingID) {
            return res.status(400).json({
                message: "Failed to identify  the listingID. Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        if (!(userData === null || userData === void 0 ? void 0 : userData.wishlist.includes(listingID)))
            return res
                .status(400)
                .json({ message: "Hotel already removed from  wishlist" });
        const updatedUser = yield userModel_1.User.findByIdAndUpdate(userID, {
            $pull: {
                wishlist: listingID,
            },
        });
        return res.status(200).json({
            message: "successfully removed from wishlist",
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.removeFromWishlist = removeFromWishlist;
const addReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m;
    try {
        const userID = new mongoose_1.default.Types.ObjectId((_m = req.userInfo) === null || _m === void 0 ? void 0 : _m.id);
        if (!userID) {
            return res.status(400).json({ message: "failed to identify user " });
        }
        let listingID = new mongoose_1.default.Types.ObjectId(req.params.listingID);
        const userData = yield userModel_1.User.findById(userID);
        if (!listingID) {
            return res.status(400).json({
                message: "Failed to identify  the listingID. Try Again ",
            });
        }
        let listingData = yield hotelLisitingModal_1.HotelListing.findById(listingID);
        if (!listingData)
            return res.status(400).json({ message: "failed to identify listing " });
        const { rating, reviewMessage } = req.body;
        if (!rating || !reviewMessage) {
            return res.status(400).json({ message: "All fields are mandatory " });
        }
        if (rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ message: "Rating value should be between 1 and 5 " });
        }
        const existingReview = yield reviewModel_1.Review.find({ userID, listingID });
        if (existingReview.length >= 1) {
            return res
                .status(400)
                .json({ message: "You already made a review on this property " });
        }
        let AvgRating = listingData.AvgRating;
        let totalReviews = listingData.reviews.length;
        AvgRating = (AvgRating * totalReviews + rating) / (totalReviews + 1);
        const review = new reviewModel_1.Review({
            userID,
            listingID,
            rating,
            reviewMessage,
        });
        yield review.save();
        const updatedListing = yield hotelLisitingModal_1.HotelListing.findByIdAndUpdate(listingID, {
            AvgRating,
            $push: { reviews: review._id },
        });
        console.log(updatedListing);
        return res.status(200).json({ message: "review added" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});
exports.addReview = addReview;
