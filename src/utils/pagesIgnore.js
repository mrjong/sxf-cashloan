export default (props) => {
    if (props && props.match && props.match.params && props.match.params.modules) {
        let pageList = ['protocol']
        return pageList.includes(props.match.params.modules)
    }
}