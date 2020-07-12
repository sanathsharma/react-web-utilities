import Axios from "axios";

class Service {
    private CancelToken = Axios.CancelToken;
    isCancel = Axios.isCancel;

    constructor() {
        Object.setPrototypeOf( this, Service.prototype );
    }

    generateCancelToken = () => {
        const { token, cancel } = this.CancelToken.source();
        return { cancelToken: token, canceler: cancel };
    };
};

export {
    Service
};