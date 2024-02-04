export interface AdminPanelPageProps {
	version: string
}

export type AdminPanelPageCompiler = (props: AdminPanelPageProps) => string

export default ((props: AdminPanelPageProps) => /* html */ `
<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Admin Panel</title>
		<link rel="stylesheet" href="/admin-panel/css/admin-panel.css">
		<script src="https://cdn.tiny.cloud/1/2gb6iwtbyyb1thm2k0ah0vmyy8k2ai1z2bvx0gh9ndhbv0ny/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
		<script src="https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js"></script>
		<script src="/admin-panel/js/query-selector.js" charset="utf-8"></script>
		<script src="/admin-panel/js/js-dsa-lib.js" charset="utf-8"></script>
		<script src="/admin-panel/js/formatting.js" charset="utf-8"></script>
		<script src="/admin-panel/js/request.js" charset="utf-8"></script>
		<script src="/admin-panel/js/auth.js" charset="utf-8"></script>
		<script src="/admin-panel/js/popup.js" charset="utf-8"></script>
		<script src="/admin-panel/js/searchboxes.js" charset="utf-8"></script>
		<script src="/admin-panel/js/admin-panel.js" charset="utf-8"></script>
	</head>
	<body>
		<div class="app">
			<div class="header">
				<ul>
					<li class="back-button-desktop"><img class="back-button" src="/admin-panel/img/back.png" alt="back" title="back" onclick="goBackInHistory()"></li>
					<li><a class="logo" href="/admin-panel/">NodeCMS</a> <span id="version-number">${ props.version }</span></li>
				</ul>
				<ul>
					<li id="greeting"></li>
					<li id="help-button"><a href="/admin-panel/docs">Help</a></li>
					<li id="logout-button"><a onclick="logout()">Logout</a></li>
					<li id="padlock" onclick="togglePadlock()">
						<img src="/admin-panel/img/locked-padlock-orange.png" alt="padlock" title="You are currently not authorised to make changes, click here to gain permission">
					</li>
				</ul>
			</div>

			<div class="menu">
				<ul>
					<li class="back-button-mobile"><img class="back-button" src="/admin-panel/img/back.png" alt="back" title="back" onclick="goBackInHistory()"></li>
					<li><a onclick="showPages()">Pages</a></li>
					<li><a onclick="showDatabaseList()">Databases</a></li>
					<li><a onclick="showFiles()">Files</a></li>
					<li><a onclick="showUserManagement()">Users</a></li>
				</ul>
			</div>

			<div class="main"></div>
		</div>
	</body>
</html>`) as AdminPanelPageCompiler