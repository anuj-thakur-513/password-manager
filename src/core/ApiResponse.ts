class ApiResponse {
  constructor(public data: Object | null, public message: string = "Success") {}
}

export default ApiResponse;
