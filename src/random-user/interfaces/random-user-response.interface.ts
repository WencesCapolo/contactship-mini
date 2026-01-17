// Interface matching the randomuser.me API response structure
export interface RandomUserName {
    title: string;
    first: string;
    last: string;
}

export interface RandomUserLocation {
    street: {
        number: number;
        name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: string | number;
}

export interface RandomUserDob {
    date: string;
    age: number;
}

export interface RandomUserPicture {
    large: string;
    medium: string;
    thumbnail: string;
}

export interface RandomUserLogin {
    uuid: string;
    username: string;
}

export interface RandomUser {
    gender: string;
    name: RandomUserName;
    location: RandomUserLocation;
    email: string;
    login: RandomUserLogin;
    dob: RandomUserDob;
    phone: string;
    cell: string;
    picture: RandomUserPicture;
    nat: string;
}

export interface RandomUserApiResponse {
    results: RandomUser[];
    info: {
        seed: string;
        results: number;
        page: number;
        version: string;
    };
}
