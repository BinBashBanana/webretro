function webretroEmbed(node, path, queries) {
	var frame = document.createElement("iframe");
	frame.style = "border: none; display: block; width: 100%; height: 100%;";
	
	// change rom path to absolute if it isn't already
	if (queries.rom) {
		var link = document.createElement("a");
		link.href = /^(http:\/\/|https:\/\/|\/\/)/i.test(queries.rom) ? queries.rom : "roms/" + queries.rom;
		queries.rom = link.href;
	}
	
	var queriesList = Object.keys(queries);
	var newQueriesList = [];
	for (var i = 0; i < queriesList.length; i++) {
		newQueriesList.push(queriesList[i] + "=" + queries[queriesList[i]]);
	}
	frame.src = path + "?" + newQueriesList.join("&");
	node.appendChild(frame);
	
	return frame;
}
