---
title: Postgresql sort 'WHERE id IN' by original id list order
date: 2014-05-02 10:36 +0200
tags: [postgresql, rails]
---

I've been testing [elasticsearch](http://www.elasticsearch.org/) in a rails project recently - and stumbled on an issue with sorting.

You see - elasticsearch returns the search results either sorted by score or by the sort order you ask for. Then you need to convert the search results to records - so a simple

```ruby
ModelType.where(id: ids)
```

However - on postgresql - this returns the records in database order (seems to be insert order).

You could try sorting post fetch:

```ruby
index = ModelType.where(id: ids).to_a.group_by(&:id)
ids.map { |i| index[i.to_i].first }
```

But - what if we want to do this in the database.

A google search led me to [this article on how to give postgresql a similar function to mysql's find_in_set](http://omarqureshi.net/articles/2010-6-10-find-in-set-for-postgresql)

So - adding a rails migration to add the function:

```sql
create or replace function find_in_array(
  needle anyelement, haystack anyarray) returns integer as $$
declare
  i integer;
begin
  for i in 1..array_upper(haystack, 1) loop
    if haystack[i] = needle then
      return i;
    end if;
  end loop;
  raise exception 'find_in_array: % not found in %', needle, haystack;
end;
$$ language 'plpgsql';
```

and an initializer file where we override:

```ruby
class String
  def sql_escape
    self.gsub(/[%_'\\"]/, "\\\\\\0")
  end
end

class Array
  def to_postgres_array
    "'{" + self.inject([]) do |mem, val|
      mem << (val.kind_of?(String) ? "\"#{val.sql_escape}\"" : val)
      mem
    end.join(", ") + "}'"
  end
end
```

We end up able to call:

```ruby
ModelType.where(id: ids).order("find_in_array(id, #{ids.to_postgres_array})")
```

Benchmarking this on my small'ish dataset shows that this _is_ faster than the post fetch sort in ruby. Not sure what it does on larger data sets though.
