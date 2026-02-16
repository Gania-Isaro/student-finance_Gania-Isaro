export function highlight(text, searchText, ignoreCase) {

    if (!searchText) return text;

    let flags = "g";
    if (ignoreCase) flags = "gi";

    const pattern = new RegExp(searchText, flags);

    return text.replace(pattern, function(match) {
        return "<mark>" + match + "</mark>";
    });
}
