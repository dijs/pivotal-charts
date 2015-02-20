var jqueryMock = jest.genMockFromModule('jquery');

var getResponseData;

jqueryMock.get.mockImplementation(function(url, callback){
	//console.log(getResponseData);
	callback(getResponseData);
});

jqueryMock.setGetResponse = function(data) {
	getResponseData = data;
};

module.exports = jqueryMock;