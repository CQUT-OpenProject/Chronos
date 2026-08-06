<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>我的</h1>
<ul>
	<li><a href={resolve('/manage-timetables')}>管理课表</a></li>
	<li><a href={resolve('/transfer/import')}>导入课表</a></li>
	<li><a href={resolve('/theme-settings')}>主题设置</a></li>
	<li><a href={resolve('/about')}>关于</a></li>
</ul>
