package httpresponse

type ResponseContainer struct {
	Data any            `json:"data"`
	Err  *ResponseError `json:"err"`
}

type ResponseError struct {
	Message string `json:"message"`
}

func ErrorResponse(message string) ResponseContainer {
	return ResponseContainer{
		Data: nil,
		Err: &ResponseError{
			Message: message,
		},
	}
}

func SuccessResponse(result any) ResponseContainer {
	return ResponseContainer{
		Data: result,
		Err:  nil,
	}
}
