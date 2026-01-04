import moment, { Moment } from "moment-timezone";
import {
	statusBuild,
	response_object_detail,
	methodNotAllowed,
	ICheckUnique,
} from "./common_interface";
import { helperConfig } from "./helper_config";

export class common_helper {

    public successStatusBuild(res: statusBuild, dataset: object, msg: string): void {

		let response_status = {
			msg: msg,
			action_status: true
		};
		/* if (process.env.ENCRYPTED_DATA == '1') {
			dataset = {
				enc_data: global.encrypt_decrypt_helper.encryptResponse_crypto(JSON.stringify(dataset))
			}
		} */
		let response_data: response_object_detail = {
			data: dataset,
			status: response_status,
		};

		res.status(helperConfig.HTTP_RESPONSE_OK);
		// res.send({ response: this.capitalizeFirstLetter(response_data) });
		res.send({ response: response_data });
	}

    public badRequestStatusBuild(res: statusBuild, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,
		};

		res.status(helperConfig.HTTP_RESPONSE_BAD_REQUEST);
		// res.send({ response: this.capitalizeFirstLetter(response_data) });
		res.send({ response: response_data });
	}

	public methodNotAllowedStatusBuild(res: methodNotAllowed, msg: string): void {
		let response_status = {
			msg: msg,
			action_status: false
		};
		let response_data: response_object_detail = {
			data: {},
			status: response_status,

		};

		res.setHeader('content-type', 'application/json');
		res.status(helperConfig.HTTP_RESPONSE_METHOD_NOT_ALLOWED);
		res.send({ response: this.capitalizeFirstLetter(response_data) });
	}

    public capitalizeFirstLetter(object: { [key: string]: any }): object {
		object.status.msg = object.status.msg.toLowerCase();
		object.status.msg = object.status.msg.charAt(0).toUpperCase() + object.status.msg.slice(1);
		return object
	}
}