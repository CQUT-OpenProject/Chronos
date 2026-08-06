<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<h1>关于</h1>
<ul>
	<li><a href={resolve('/about/version-release')}>版本信息</a></li>
	<li><a href={resolve('/open-source-licenses')}>开源许可</a></li>
</ul>
<a href={resolve('/mine')}>返回</a>
